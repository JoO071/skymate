using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using SkyMate.Application.AI;
using SkyMate.Application.Interfaces.Chatbot;
using SkyMate.Domain.Enums;

namespace SkyMate.Infrastructure.AI;

/// <summary>Calls Gemini's stateless Interactions REST API using local database history.</summary>
public sealed class GeminiAssistantLlmClient(
    HttpClient httpClient,
    IOptions<AssistantAiOptions> options) : IAssistantLlmClient
{
    private readonly AssistantAiOptions _options = options.Value;

    /// <inheritdoc />
    public async Task<AssistantLlmResponse> GenerateAsync(
        AssistantLlmRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new AssistantConfigurationException(
                "The Gemini API key is missing. Configure AssistantAi:ApiKey with User Secrets for development or AssistantAi__ApiKey in production.");
        }

        using var timeoutSource = new CancellationTokenSource(TimeSpan.FromSeconds(_options.TimeoutSeconds));
        using var linkedSource = CancellationTokenSource.CreateLinkedTokenSource(
            cancellationToken,
            timeoutSource.Token);

        using var message = new HttpRequestMessage(HttpMethod.Post, "v1beta/interactions");
        message.Headers.Add("x-goog-api-key", _options.ApiKey);
        message.Content = JsonContent.Create(new GeminiInteractionRequest(
            _options.Model,
            request.SystemInstruction,
            request.Messages.SelectMany(ToInputSteps).ToArray(),
            Store: false,
            new GeminiGenerationConfig(
                MaxOutputTokens: 2048,
                Temperature: SupportsTemperature(_options.Model) ? 0.3 : null)));

        HttpResponseMessage response;
        try
        {
            response = await httpClient.SendAsync(
                message,
                HttpCompletionOption.ResponseHeadersRead,
                linkedSource.Token);
        }
        catch (OperationCanceledException exception) when (timeoutSource.IsCancellationRequested &&
                                                           !cancellationToken.IsCancellationRequested)
        {
            throw new AssistantProviderTimeoutException(
                "The AI provider did not respond before the configured timeout.",
                exception);
        }
        catch (HttpRequestException exception)
        {
            throw new AssistantProviderException("The AI provider could not be reached.", exception);
        }

        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                var httpStatus = (int)response.StatusCode;
                if (response.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    throw new AssistantProviderRateLimitException("The Gemini quota or rate limit was reached.");
                }

                if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden or
                    HttpStatusCode.NotFound)
                {
                    throw new AssistantConfigurationException(
                        "Gemini rejected the configured API key or model. Verify AssistantAi:ApiKey and AssistantAi:Model.");
                }

                throw new AssistantProviderException(
                    $"The AI provider returned HTTP {httpStatus} ({response.StatusCode}).");
            }

            GeminiInteractionResponse? providerResponse;
            string responseBody;
            try
            {
                responseBody = await response.Content.ReadAsStringAsync(linkedSource.Token);
                providerResponse = JsonSerializer.Deserialize<GeminiInteractionResponse>(responseBody);
            }
            catch (OperationCanceledException exception) when (timeoutSource.IsCancellationRequested &&
                                                               !cancellationToken.IsCancellationRequested)
            {
                throw new AssistantProviderTimeoutException(
                    "The AI provider did not respond before the configured timeout.",
                    exception);
            }
            catch (HttpRequestException exception)
            {
                throw new AssistantProviderException("The AI provider response could not be read.", exception);
            }
            catch (JsonException exception)
            {
                throw new AssistantProviderException("The AI provider returned an invalid response.", exception);
            }

            if (providerResponse?.Status is { Length: > 0 } status &&
                !string.Equals(status, "completed", StringComparison.OrdinalIgnoreCase))
            {
                throw new AssistantProviderException($"The AI provider returned an interaction with status '{status}'.");
            }

            var output = providerResponse?.OutputText;
            if (string.IsNullOrWhiteSpace(output))
            {
                output = string.Join(
                    string.Empty,
                    providerResponse?.Steps?
                        .Where(step => string.Equals(step.Type, "model_output", StringComparison.Ordinal))
                        .SelectMany(step => step.Content ?? [])
                        .Where(part => string.Equals(part.Type, "text", StringComparison.Ordinal))
                        .Select(part => part.Text) ?? []);
            }

            if (string.IsNullOrWhiteSpace(output))
            {
                throw new AssistantProviderException("The AI provider response contained no text output.");
            }

            return new AssistantLlmResponse(output.Trim(), ExtractProviderContextJson(responseBody));
        }
    }

    private static IReadOnlyList<JsonElement> ToInputSteps(AssistantLlmTurn turn)
    {
        if (turn.Role == ConversationRole.Assistant && !string.IsNullOrWhiteSpace(turn.ProviderContextJson))
        {
            try
            {
                using var document = JsonDocument.Parse(turn.ProviderContextJson);
                if (document.RootElement.ValueKind == JsonValueKind.Array)
                {
                    var storedSteps = document.RootElement.EnumerateArray()
                        .Where(step => step.ValueKind == JsonValueKind.Object)
                        .Select(step => step.Clone())
                        .ToArray();
                    if (storedSteps.Length > 0)
                    {
                        return storedSteps;
                    }
                }
            }
            catch (JsonException)
            {
                // Old or invalid metadata falls back to the user-visible assistant text.
            }
        }

        var type = turn.Role == ConversationRole.Assistant ? "model_output" : "user_input";
        return
        [
            JsonSerializer.SerializeToElement(new GeminiInputStep(
                type,
                [new GeminiTextPart("text", turn.Content)]))
        ];
    }

    private static string? ExtractProviderContextJson(string responseBody)
    {
        using var document = JsonDocument.Parse(responseBody);
        if (!document.RootElement.TryGetProperty("steps", out var steps) ||
            steps.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var reusableSteps = steps.EnumerateArray()
            .Where(step => step.ValueKind == JsonValueKind.Object &&
                           step.TryGetProperty("type", out var type) &&
                           type.ValueKind == JsonValueKind.String &&
                           type.GetString() is "thought" or "model_output")
            .Select(step => step.Clone())
            .ToArray();

        return reusableSteps.Length == 0 ? null : JsonSerializer.Serialize(reusableSteps);
    }

    // Gemini 3.6+ ignores sampling parameters and reports a deprecation warning. Keep the AI team's
    // temperature for supported model families, while omitting it for the current 3.8 default.
    private static bool SupportsTemperature(string model) =>
        model.StartsWith("gemini-3.5-", StringComparison.OrdinalIgnoreCase) ||
        model.StartsWith("gemini-3.1-", StringComparison.OrdinalIgnoreCase) ||
        model.StartsWith("gemini-2.", StringComparison.OrdinalIgnoreCase);

    private sealed record GeminiInteractionRequest(
        [property: JsonPropertyName("model")] string Model,
        [property: JsonPropertyName("system_instruction")] string SystemInstruction,
        [property: JsonPropertyName("input")] IReadOnlyList<JsonElement> Input,
        [property: JsonPropertyName("store")] bool Store,
        [property: JsonPropertyName("generation_config")] GeminiGenerationConfig GenerationConfig);

    private sealed record GeminiGenerationConfig(
        [property: JsonPropertyName("max_output_tokens")] int MaxOutputTokens,
        [property: JsonPropertyName("temperature")]
        [property: System.Text.Json.Serialization.JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        double? Temperature);

    private sealed record GeminiInputStep(
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("content")] IReadOnlyList<GeminiTextPart> Content);

    private sealed record GeminiTextPart(
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("text")] string Text);

    private sealed record GeminiInteractionResponse(
        [property: JsonPropertyName("status")] string? Status,
        [property: JsonPropertyName("output_text")] string? OutputText,
        [property: JsonPropertyName("steps")] IReadOnlyList<GeminiOutputStep>? Steps);

    private sealed record GeminiOutputStep(
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("content")] IReadOnlyList<GeminiTextPart>? Content);
}
