import { useCallback, useEffect, useState } from 'react'

import { useLanguage } from '../../context/useLanguage'
import { useProfile } from '../../context/useProfile'
import icons from '../../data/icons'
import type { HeroTypingAnimationProps } from '../../types/app.js'
import '../css/HeroTyping.css'

const EMPTY_ROLES: string[] = []
const DEFAULT_HERO_PHOTO = '/imgs/michael.jpg'
const DEFAULT_HERO_NAME = 'Michael Piccirilli'

function HeroPortrait({
  photo,
  alt,
  contentReady,
  ariaHidden = false,
}: {
  photo: string
  alt: string
  contentReady: boolean
  ariaHidden?: boolean
}) {
  const [loadedPhoto, setLoadedPhoto] = useState<string | null>(null)
  const photoLoaded = loadedPhoto === photo

  const handlePhotoRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (!photo || !image) return

      if (image.complete && image.naturalWidth > 0) {
        setLoadedPhoto((current) => (current === photo ? current : photo))
      }
    },
    [photo]
  )

  return (
    <div
      className={`hero-typing-image photo-glow${photoLoaded ? ' is-loaded' : ' is-loading'}${contentReady ? ' is-content-ready' : ''}`}
      aria-hidden={ariaHidden}
    >
      {photo ? (
        <img
          ref={handlePhotoRef}
          className="float-animation"
          src={photo}
          alt={alt}
          decoding="async"
          fetchPriority="high"
          onLoad={() => setLoadedPhoto(photo)}
          onError={() => setLoadedPhoto(photo)}
        />
      ) : null}
    </div>
  )
}

function HeroTypingSkeletonText() {
  return (
    <div className="hero-typing-text hero-skeleton-text" aria-hidden="true">
      <div className="hero-skeleton-line hero-skeleton-line-sm" />
      <div className="hero-skeleton-line hero-skeleton-line-xl" />
      <div className="hero-skeleton-line hero-skeleton-line-md" />
      <div className="hero-skeleton-badge" />
      <div className="hero-typing-actions">
        <span className="hero-skeleton-btn" />
        <span className="hero-skeleton-btn hero-skeleton-btn-outline" />
      </div>
      <div className="hero-typing-socials">
        <span className="hero-skeleton-icon" />
        <span className="hero-skeleton-icon" />
      </div>
    </div>
  )
}

function HeroTypingAnimationText({
  nameText,
  roles,
  university,
  socials,
  greeting,
  uniName,
  t,
}: Omit<HeroTypingAnimationProps, 'photo'>) {
  const [roleIndex, setRoleIndex] = useState(0)
  const [roleCharIndex, setRoleCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasRoleRendered, setHasRoleRendered] = useState(false)

  useEffect(() => {
    const currentRole = roles[roleIndex]
    if (!currentRole) return

    let timeout: number | ReturnType<typeof setTimeout> | undefined

    if (!isDeleting && roleCharIndex < currentRole.length) {
      timeout = setTimeout(() => {
        setRoleCharIndex(roleCharIndex + 1)
        setHasRoleRendered(true)
      }, 65)
    } else if (!isDeleting && roleCharIndex === currentRole.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800)
    } else if (isDeleting && roleCharIndex > 0) {
      timeout = setTimeout(() => setRoleCharIndex(roleCharIndex - 1), 32)
    } else if (isDeleting && roleCharIndex === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setRoleIndex((roleIndex + 1) % roles.length)
      }, 120)
    }

    return () => clearTimeout(timeout)
  }, [roleCharIndex, isDeleting, roleIndex, roles])

  const displayRole = roles[roleIndex]
    ? roles[roleIndex].substring(0, roleCharIndex)
    : ''
  const showRolePlaceholder =
    roles.length > 0 && !hasRoleRendered && displayRole.length === 0

  return (
    <div className="hero-typing-text">
      <p className="hero-typing-greeting">{greeting}</p>
      <h1 className="hero-typing-name">
        <span className="typed-text">{nameText}</span>
      </h1>
      <h2 className="hero-typing-role">
        {showRolePlaceholder ? (
          <span
            className="hero-inline-skeleton hero-inline-skeleton-role"
            aria-hidden="true"
          />
        ) : (
          <>
            <span className="typed-text">{displayRole}</span>
            <span className="cursor">|</span>
          </>
        )}
      </h2>
      {uniName ? (
        <div className="hero-university-badge">
          {university.logo ? (
            <img
              src={university.logo}
              alt={uniName}
              className="hero-university-logo"
              decoding="async"
            />
          ) : null}
          <span>{uniName}</span>
        </div>
      ) : null}
      <div className="hero-typing-actions">
        <a href="#projects" className="btn btn-primary">
          {t('hero.btnProjects')}
        </a>
        <a href="#contact" className="btn btn-outline">
          {t('hero.btnContact')}
        </a>
      </div>
      <div className="hero-typing-socials">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.name}
          >
            {icons[social.icon]?.(22)}
          </a>
        ))}
      </div>
    </div>
  )
}

function HeroTyping() {
  const { t, lang } = useLanguage()
  const { profile, loading: profileLoading } = useProfile()
  const nameText = profile?.name || DEFAULT_HERO_NAME
  const photo = profile?.photo || DEFAULT_HERO_PHOTO
  const university = profile?.university || { logo: '', name: '' }
  const socials = Array.isArray(profile?.socials) ? profile.socials : []
  const roles = Array.isArray(profile?.roles) ? profile.roles : EMPTY_ROLES
  const greeting = profile?.greeting || t('hero.greeting')
  const uniName = university.name || ''
  const animationKey = `${lang}:${nameText}:${roles.join('|')}`
  const isReady = !profileLoading
  const portraitAlt = nameText || DEFAULT_HERO_NAME

  return (
    <section id="hero" className="hero-typing">
      <div className="hero-typing-container hero-animate">
        {isReady ? (
          <HeroTypingAnimationText
            key={animationKey}
            nameText={nameText}
            roles={roles}
            university={university}
            socials={socials}
            greeting={greeting}
            uniName={uniName}
            t={t}
          />
        ) : (
          <HeroTypingSkeletonText />
        )}
        <HeroPortrait
          photo={photo}
          alt={portraitAlt}
          contentReady={isReady}
          ariaHidden={!isReady}
        />
      </div>
    </section>
  )
}

export default HeroTyping
