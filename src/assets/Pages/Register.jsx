import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroImg from '../images/Istanbul.jpeg'
import { useLang } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import '../Styles/Register.css'

/* ---------- Small helpers ---------- */
function PlaneIcon({ size = 18, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l18-8-8 18-2-8-8-2z" />
    </svg>
  )
}

function PasswordField({ id, label, value, onChange, hint, error, minLength }) {
  const { t } = useLang()
  const [show, setShow] = useState(false)

  return (
    <div className="mb-3">
      <div
        className={`form-floating register-field ${hint ? 'register-field--hint' : ''} ${
          error ? 'register-field--invalid' : ''
        }`}
      >
        <input
          type={show ? 'text' : 'password'}
          className="form-control"
          id={id}
          placeholder={label}
          value={value}
          onChange={onChange}
          minLength={minLength}
          required
        />
        <label htmlFor={id}>{label}</label>
        {hint && <span className="register-field__hint">{hint}</span>}

        <button
          type="button"
          className="register-field__icon btn p-0 border-0"
          onClick={() => setShow(!show)}
          aria-label={show ? t('hidePassword') : t('showPassword')}
        >
          {show ? (
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
      {error && <div className="register-error">{error}</div>}
    </div>
  )
}

/* ---------- Page ---------- */
function Register() {
  const { t, lang, toggleLang } = useLang()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)

  const mismatch = confirm !== '' && confirm !== password

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mismatch) return
    // TODO (Backend): ابعت البيانات للـ API، ولما ينجح نادي register(user)
    register({ name: fullName, email })
    navigate('/')
  }

  // "I agree to the {terms} and {privacy}." -> نص + لينكات (يشتغل مع ترتيب الجملة في العربي كمان)
  const agreeParts = t('agree').split(/(\{terms\}|\{privacy\})/)

  return (
    <div className="container-fluid register-page">
      <div className="row g-0 min-vh-100">
        {/* ===== Left: hero (desktop only) ===== */}
        <aside
          className="d-none d-lg-flex flex-column register-hero text-white"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <div className="register-hero__overlay" />

          <div className="register-hero__content d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center gap-2">
              <span className="register-brand__icon">
                <PlaneIcon />
              </span>
              <span className="fw-semibold fs-5">SkyMate</span>
            </div>

            <div>
              <span className="badge rounded-pill register-badge mb-4">{t('heroBadge')}</span>
              <h1 className="register-hero__title fw-semibold">{t('heroTitle')}</h1>
              <p className="register-hero__text mt-4 mb-4">{t('heroText')}</p>
              <small className="register-hero__caption">{t('heroCaption')}</small>
            </div>
          </div>
        </aside>

        {/* ===== Right: form ===== */}
        <main className="col-12 register-main d-flex flex-column bg-white">
          <div className="register-form-wrap mx-auto w-100 d-flex flex-column flex-grow-1 px-4 px-lg-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center pt-4 register-small">
              {/* Desktop */}
              <Link to="/" className="d-none d-lg-inline text-decoration-none register-muted">
                {t('backHome')}
              </Link>

              {/* Tablet + Mobile */}
              <Link to="/" className="d-flex d-lg-none align-items-center gap-2 text-decoration-none register-brand-dark">
                <span className="register-brand__icon">
                  <PlaneIcon stroke="#fff" />
                </span>
                <span className="fw-semibold fs-4">SkyMate</span>
              </Link>

              <button type="button" className="lang-btn" onClick={toggleLang} aria-label="Switch language">
                {lang.toUpperCase()}
              </button>
            </div>

            {/* Body */}
            <div className="my-auto py-4 py-lg-5">
              <h2 className="register-title fw-bold mb-3">{t('registerTitle')}</h2>
              <p className="register-muted mb-4 register-small">{t('registerSub')}</p>

              <form onSubmit={handleSubmit}>
                {/* Full name */}
                <div className="form-floating register-field mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    placeholder={t('fullName')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <label htmlFor="fullName">{t('fullName')}</label>
                </div>

                {/* Email */}
                <div className="form-floating register-field mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="regEmail"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="regEmail">{t('email')}</label>
                  <span className="register-field__icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </span>
                </div>

                {/* Password */}
                <PasswordField
                  id="regPassword"
                  label={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  hint={t('passwordHint')}
                  minLength={12}
                />

                {/* Confirm password */}
                <PasswordField
                  id="regConfirm"
                  label={t('confirmPassword')}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  error={mismatch ? t('mismatch') : ''}
                />

                {/* Terms (المساحة كلها بتعلّم/تشيل العلامة) */}
                <div className={`form-check register-check mb-0 ${agree ? 'register-check--active' : ''}`}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="agree"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    required
                  />
                  <label className="form-check-label" htmlFor="agree">
                    {agreeParts.map((part, i) => {
                      if (part === '{terms}')
                        return <a key={i} href="#" className="register-link">{t('termsLink')}</a>
                      if (part === '{privacy}')
                        return <a key={i} href="#" className="register-link">{t('privacyLink')}</a>
                      return part
                    })}
                  </label>
                </div>

                <p className="register-tiny register-muted mt-2 mb-3">{t('prefsNote')}</p>

                <button type="submit" className="btn register-btn w-100">
                  {t('createAccount')}
                </button>
              </form>

              <p className="text-center mt-4 register-small register-muted">
                {t('haveAccount')}{' '}
                <Link to="/login" className="register-muted">{t('loginLink')}</Link>
              </p>
            </div>

            {/* Footer */}
            <footer className="pb-4 register-tiny register-muted">
              <p className="mb-2">{t('designNote')}</p>
              <p className="mb-0">
                {t('projectLine')}{' '}
                <a href="#" className="register-muted">{t('privacy')}</a> ·{' '}
                <a href="#" className="register-muted">{t('terms')}</a> ·{' '}
                <a href="#" className="register-muted">{t('about')}</a>
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Register