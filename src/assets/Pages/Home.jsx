import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import heroImg from '../images/Istanbul.jpeg'
import { useLang } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import '../Styles/Home.css'

/*
  الصور التانية بتتحط في فولدر public/images/ بالأسماء دي:
  cairo.jpg  rome.jpg  galata.jpg
  لو الصورة مش موجودة بيظهر لون هادي مكانها والموقع يشتغل عادي.
*/
const pub = (file) => `${import.meta.env.BASE_URL}images/${file}`
const cardImages = [heroImg, pub('cairo.jpg'), pub('rome.jpg')]
const bg = (src) => ({ backgroundImage: `url(${src})` })

function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </svg>
  )
}

/*
  قايمة منسدلة بسكرول (بتتبعت مع الفورم عن طريق input مخفي بنفس الـ name).
  options: مصفوفة نصوص. الباك اند يقدر يبدّلها بالداتا اللي جاية من الـ API.
*/
function Select({ id, name, label, options }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const ref = useRef(null)

  // اقفل القايمة لما تضغط بره أو تدوس Esc
  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const choose = (i) => {
    setIndex(i)
    setOpen(false)
  }

  return (
    <div className={`home-select ${open ? 'is-open' : ''}`} ref={ref}>
      <input type="hidden" name={name} value={options[index] ?? ''} />
      <button
        type="button"
        id={id}
        className="home-field home-select__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="home-select__label">{label}</span>
        <span className="home-select__value">{options[index]}</span>
        <svg className="home-select__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="home-select__menu" role="listbox" aria-labelledby={id}>
          {options.map((opt, i) => (
            <li key={opt} role="option" aria-selected={i === index}>
              <button
                type="button"
                className={`home-select__opt ${i === index ? 'is-selected' : ''}`}
                onClick={() => choose(i)}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Home() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const { hash } = useLocation()
  const navigate = useNavigate()

  // السكرول للقسم لما اللينك يبقى فيه #
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [hash])

  const planTo = user ? { pathname: '/', hash: '#search' } : '/register'

  const handleSearch = (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    // TODO (Backend): ابعت الداتا دي للـ API
    console.log(Object.fromEntries(new FormData(e.currentTarget)))
  }

  return (
    <div className="home-page">
      <Navbar variant="solid" />

      {/* ===== Hero ===== */}
      <section className="home-hero" style={bg(heroImg)}>
        <div className="home-hero__overlay" />
        <div className="container home-hero__content">
          {user ? (
            <div className="home-welcome">
              <span className="home-pill home-pill--welcome">
                {t('welcome').replace('{name}', user.name)}
              </span>
              <p className="home-welcome__sub">{t('welcomeSub')}</p>
            </div>
          ) : (
            <span className="home-pill">{t('homeBadge')}</span>
          )}

          <h1 className="home-hero__title">{t('homeTitle')}</h1>
          <p className="home-hero__text">{t('homeText')}</p>

          <div className="d-flex flex-wrap gap-2 mb-3">
            <Link to={planTo} className="home-btn home-btn--glass">
              <Sparkle />
              {t('planMyTrip')}
            </Link>
            <Link to={{ pathname: '/', hash: '#destinations' }} className="home-btn home-btn--light">
              {t('exploreBtn')}
            </Link>
          </div>
          <p className="home-hero__caption">{t('homeCaption')}</p>
        </div>
      </section>

      {/* ===== Search ===== */}
      <section id="search" className="home-search">
        <div className="container">
          <h2 className="home-search__title">{t('searchTitle')}</h2>
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4 col-lg">
                <Select key={`d-${lang}`} id="destination" name="destination" label={t('fieldDestination')} options={t('destOptions')} />
              </div>
              <div className="col-md-4 col-lg">
                <Select key={`t-${lang}`} id="dates" name="dates" label={t('fieldDates')} options={t('dateOptions')} />
              </div>
              <div className="col-md-4 col-lg">
                <Select key={`v-${lang}`} id="travelers" name="travelers" label={t('fieldTravelers')} options={t('travelerOptions')} />
              </div>
              <div className="col-12 col-lg-auto d-flex">
                <button type="submit" className="home-btn home-btn--dark home-btn--search">
                  {t('startPlanning')}
                </button>
              </div>
            </div>
            <p className="home-note">{t('searchNote')}</p>
          </form>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how" className="home-section home-section--soft">
        <div className="container">
          <h2 className="home-h2">{t('stepsTitle')}</h2>
          <div className="row g-3 g-lg-4 mt-1">
            {t('steps').map((s, i) => (
              <div className="col-md-4" key={s.title}>
                <h3 className="home-h3">0{i + 1} / {s.title}</h3>
                <p className="home-p">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="home-section">
        <div className="container">
          <h2 className="home-h2">{t('featuresTitle')}</h2>
          <div className="row g-3 mt-1">
            {t('features').map((f) => (
              <div className="col-sm-6 col-lg-3" key={f.title}>
                <div className="home-mini">
                  <h3 className="home-h3 home-h3--sm">{f.title}</h3>
                  <p className="home-p home-p--sm mb-0">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Destinations ===== */}
      <section id="destinations" className="home-section home-section--soft">
        <div className="container">
          <h2 className="home-h2">{t('destTitle')}</h2>
          <p className="home-p mb-4">{t('destSub')}</p>
          <div className="row g-3 g-lg-4">
            {t('destinations').map((d, i) => (
              <div className="col-md-4" key={d.name}>
                <div className="home-dest">
                  <div className="home-dest__img" style={bg(cardImages[i])} />
                  <div className="home-dest__body">
                    <h3 className="home-h3 mb-1">{d.name}</h3>
                    <p className="home-p home-p--sm mb-1">{d.tags}</p>
                    <Link to={planTo} className="home-dest__link">{t('exploreLink')}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Banner ===== */}
      <section className="home-banner">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="home-banner__img" style={bg(pub('galata.jpg'))} />
            </div>
            <div className="col-lg-6">
              <h2 className="home-banner__title">{t('bannerTitle')}</h2>
              <p className="home-banner__text">{t('bannerText')}</p>
              <span className="home-chip">{t('bannerPill')}</span>
              <p className="home-banner__small">{t('bannerEstimate')}</p>
              <Link to={planTo} className="home-btn home-btn--light">{t('bannerBtn')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== About ===== */}
      <section id="about" className="home-section home-section--soft">
        <div className="container">
          <h2 className="home-h2">{t('aboutTitle')}</h2>
          <div className="row g-3 g-lg-4 mt-1">
            {t('aboutItems').map((a) => (
              <div className="col-md-4" key={a.title}>
                <h3 className="home-h3">{a.title}</h3>
                <p className="home-p">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--white">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <h2 className="home-h2 mb-1">{t('calmTitle')}</h2>
              <span className="home-label-caps">{t('calmLabel')}</span>
            </div>
            <div className="col-lg-6">
              <h3 className="home-h3">{t('calmSubTitle')}</h3>
              <p className="home-p mb-0">{t('calmText')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-section--soft home-section--tight">
        <div className="container">
          <h3 className="home-h3 home-h3--lg">{t('usefulTitle')}</h3>
          <p className="home-p mb-0">{t('usefulText')}</p>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="home-cta">
        <div className="container">
          <h2 className="home-h2">{t('ctaTitle')}</h2>
          <p className="home-p mb-4">{t('ctaText')}</p>
          <Link to={planTo} className="home-btn home-btn--dark">
            <Sparkle />
            {t('planMyTrip')}
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="home-footer">
        <div className="container">
          <div className="home-footer__brand">
            <span className="home-footer__logo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l18-8-8 18-2-8-8-2z" />
              </svg>
            </span>
            SkyMate
          </div>
          <p className="home-footer__tagline">{t('footerTagline')}</p>
          <p className="home-footer__links">
            <Link to={{ pathname: '/', hash: '#destinations' }}>{t('navExplore')}</Link>
            <Link to={{ pathname: '/', hash: '#search' }}>{t('navPlan')}</Link>
            <Link to={{ pathname: '/', hash: '#features' }}>{t('navTranslator')}</Link>
            <Link to={{ pathname: '/', hash: '#about' }}>{t('navAbout')}</Link>
            <a href="#">{t('privacy')}</a>
            <a href="#">{t('terms')}</a>
            <a href="#">{t('footerProject')}</a>
          </p>
          <p className="home-footer__small">
            {t('footerCopy')}
            <br />
            {t('footerDisclaimer')}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home