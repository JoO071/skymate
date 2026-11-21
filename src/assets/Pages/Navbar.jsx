import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import '../Styles/Navbar.css'

function Logo() {
  return (
    <span className="sm-nav__logo">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l18-8-8 18-2-8-8-2z" />
      </svg>
    </span>
  )
}

// variant: 'overlay' (فوق صورة الهيرو) أو 'solid' (خلفية بيضا)
function Navbar({ variant = 'overlay' }) {
  const { t, lang, toggleLang } = useLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname, hash } = useLocation()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  // قفل السكرول وقت فتح القائمة + إغلاقها بزرار Esc
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const links = [
    { label: t('navHome'), to: '/', active: pathname === '/' && !hash },
    { label: t('navExplore'), to: { pathname: '/', hash: '#destinations' } },
    { label: t('navPlan'), to: { pathname: '/', hash: '#search' } },
    { label: t('navTranslator'), to: { pathname: '/', hash: '#features' } },
    { label: t('navAbout'), to: { pathname: '/', hash: '#about' } },
  ]

  const planTo = user ? { pathname: '/', hash: '#search' } : '/register'

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <>
      <header className={`sm-nav sm-nav--${variant}`}>
        <div className="container sm-nav__inner">
          <div className="d-flex align-items-center gap-3">
            <button type="button" className="sm-nav__burger" aria-label={t('menu')} onClick={() => setOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <Link to="/" className="sm-nav__brand">
              <Logo />
              <span>SkyMate</span>
            </Link>
          </div>

          <nav className="sm-nav__links d-none d-lg-flex">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className={l.active ? 'is-active' : ''}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="d-flex align-items-center gap-3">
            <button type="button" className="lang-btn" onClick={toggleLang} aria-label="Switch language">
              {lang.toUpperCase()}
            </button>

            {user ? (
              <Link to="/userinfo" className="sm-nav__user d-none d-sm-inline">{user.name}</Link>
            ) : (
              <Link to="/login" className="sm-nav__login d-none d-sm-inline">{t('navLogin')}</Link>
            )}

            <Link to={planTo} className="sm-btn d-none d-md-inline-flex">{t('planMyTrip')}</Link>
          </div>
        </div>
      </header>

      {/* ===== Drawer ===== */}
      <div className={`sm-drawer__backdrop ${open ? 'is-open' : ''}`} onClick={close} />
      <aside className={`sm-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <span className="sm-nav__brand">
            <Logo />
            <span>SkyMate</span>
          </span>
          <button type="button" className="sm-nav__burger" aria-label={t('closeMenu')} onClick={close}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {user ? (
          <div className="sm-drawer__user">
            <span className="sm-drawer__avatar">{user.name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <div className="fw-semibold text-truncate">{user.name}</div>
              <div className="sm-drawer__email text-truncate">{user.email}</div>
            </div>
          </div>
        ) : (
          <div className="d-grid gap-2 mb-3">
            <Link to="/login" className="sm-btn" onClick={close}>{t('navLogin')}</Link>
            <Link to="/register" className="sm-btn sm-btn--outline" onClick={close}>{t('signUp')}</Link>
          </div>
        )}

        {user && (
          <Link to="/userinfo" className="sm-drawer__item sm-drawer__item--main" onClick={close}>
            {t('userInformation')}
          </Link>
        )}

        <nav className="d-flex flex-column d-lg-none mt-2">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="sm-drawer__item" onClick={close}>
              {l.label}
            </Link>
          ))}
        </nav>

        {user && (
          <button type="button" className="sm-drawer__item sm-drawer__logout" onClick={handleLogout}>
            {t('logout')}
          </button>
        )}
      </aside>
    </>
  )
}

export default Navbar