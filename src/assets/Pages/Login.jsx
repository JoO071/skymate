import { useState } from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../images/Istanbul.jpeg'
import { useLang } from '../i18n/LanguageContext'
import '../Styles/Login.css'

function Login() {
  const { t, lang, toggleLang } = useLang()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: اربطها بالـ API بعدين
    console.log({ email, password, remember })
  }

  return (
    <div className="container-fluid login-page">
      <div className="row g-0 min-vh-100">
        {/* ===== Left: hero ===== */}
        <aside
          className="col-12 col-lg-6 d-flex flex-column login-hero text-white"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <div className="login-hero__overlay" />

          <div className="login-hero__content d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center gap-2 login-brand">
              <span className="login-brand__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l18-8-8 18-2-8-8-2z" />
                </svg>
              </span>
              <span className="fw-semibold fs-5">SkyMate</span>
            </div>

            <div>
              <span className="badge rounded-pill login-badge mb-4">{t('heroBadge')}</span>
              <h1 className="login-hero__title fw-semibold">{t('heroTitle')}</h1>
              <p className="login-hero__text mt-4 mb-4 d-none d-lg-block">{t('heroText')}</p>
              <small className="login-hero__caption d-none d-lg-block">{t('heroCaption')}</small>
            </div>
          </div>
        </aside>

        {/* ===== Right: form ===== */}
        <main className="col-12 col-lg-6 d-flex flex-column bg-white">
          <div className="login-form-wrap mx-auto w-100 d-flex flex-column flex-grow-1 px-4">
            <div className="d-flex justify-content-between pt-4 login-small">
              <Link to="/" className="text-decoration-none login-muted">{t('backHome')}</Link>
              <button type="button" className="lang-btn" onClick={toggleLang} aria-label="Switch language">
                {lang.toUpperCase()}
              </button>
            </div>

            <div className="my-auto py-4 py-lg-5">
              <h2 className="login-title fw-bold mb-3">{t('loginTitle')}</h2>
              <p className="login-muted mb-4 login-small">{t('loginSub')}</p>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="form-floating login-field mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="email">{t('email')}</label>
                  <span className="login-field__icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </span>
                </div>

                {/* Password */}
                <div className="form-floating login-field mb-3">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="password"
                    placeholder={t('password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="password">{t('password')}</label>
                  <button
                    type="button"
                    className="login-field__icon btn p-0 border-0"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.9 10.9 0 0112 20C5 20 1 12 1 12a18.5 18.5 0 015.06-5.94M9.9 4.24A10.9 10.9 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Remember + Forgot */}
                <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                  <label
                    htmlFor="remember"
                    style={{ cursor: 'pointer' }}
                    className={`form-check login-remember flex-grow-1 mb-0 ${
                      remember ? 'login-remember--active' : ''
                    }`}
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span className="form-check-label">{t('rememberMe')}</span>
                  </label>
                  <Link to="/forgot-password" className="login-link login-small fw-semibold text-nowrap">
                    {t('forgot')}
                  </Link>
                </div>

                <button type="submit" className="btn login-btn w-100">
                  {t('loginBtn')}
                </button>
              </form>

              <p className="text-center mt-4 login-small login-muted">
                {t('newTo')}{' '}
                <Link to="/register" className="login-muted">{t('signUp')}</Link>
              </p>
            </div>

            <footer className="pb-4 login-tiny login-muted">
              <p className="mb-2">{t('designNote')}</p>
              <p className="mb-0">
                {t('projectLine')}{' '}
                <a href="#" className="login-muted">{t('privacy')}</a> ·{' '}
                <a href="#" className="login-muted">{t('terms')}</a> ·{' '}
                <a href="#" className="login-muted">{t('about')}</a>
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Login