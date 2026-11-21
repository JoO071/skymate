import { Link, Navigate, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useLang } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import '../Styles/Userinfo.css'

function UserInfo() {
  const { t } = useLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // لو مفيش يوزر مسجّل دخول، رجّعه لصفحة Login بدل ما الصفحة تقع
  if (!user) return <Navigate to="/login" replace />

  // TODO (Backend): هات بيانات المستخدم من الـ API بدل localStorage
  const rows = [
    { label: t('fullName'), value: user.name },
    { label: t('email'), value: user.email },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="ui-page">
      <Navbar variant="solid" />

      <main className="container ui-main">
        <Link to="/" className="ui-back">{t('backHome')}</Link>

        <div className="ui-card">
          <div className="ui-head">
            <span className="ui-avatar">{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <h1 className="ui-title">{t('userInfoTitle')}</h1>
              <p className="ui-sub mb-0">{t('userInfoSub')}</p>
            </div>
          </div>

          <dl className="ui-list">
            {rows.map((r) => (
              <div className="ui-row" key={r.label}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>

          <button type="button" className="ui-logout" onClick={handleLogout}>
            {t('logout')}
          </button>
        </div>
      </main>
    </div>
  )
}

export default UserInfo