import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLanguage } from '../../context/useLanguage'
import { useProfile } from '../../context/useProfile'
import heroFallback from '../../data/heroFallback.json'
import icons from '../../data/icons'
import type { HeroTypingAnimationProps } from '../../types/app.js'
import '../css/HeroTyping.css'

const EMPTY_ROLES: string[] = []

interface HeroFallbackData {
  name: string
  photo: string
  roles: {
    it: string
    en: string
  }
  university: {
    logo: string
    name: {
      it: string
      en: string
    }
  }
  socials: Array<{
    name: string
    url: string
    icon: string
  }>
}

const FALLBACK_HERO = heroFallback as HeroFallbackData
const HERO_SOCIAL_PRIORITY: Record<string, number> = {
  linkedin: 0,
  github: 1,
}

const orderHeroSocials = (
  socials: Array<{ name: string; url: string; icon: string }>
) =>
  [...socials].sort((a, b) => {
    const pa = HERO_SOCIAL_PRIORITY[a.icon] ?? 99
    const pb = HERO_SOCIAL_PRIORITY[b.icon] ?? 99
    if (pa !== pb) return pa - pb
    return a.name.localeCompare(b.name)
  })

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

interface HeroTypingAnimationTextProps
  extends Omit<HeroTypingAnimationProps, 'photo'> {
  fallbackRole: string
  languageKey: string
}

const areRoleListsEqual = (current: string[], next: string[]) => {
  if (current.length !== next.length) return false
  return current.every((role, index) => role === next[index])
}

function HeroTypingAnimationText({
  nameText,
  roles,
  university,
  socials,
  greeting,
  uniName,
  t,
  fallbackRole,
  languageKey,
}: HeroTypingAnimationTextProps) {
  const roleSource = useMemo(
    () => (roles.length > 0 ? roles : [fallbackRole || FALLBACK_HERO.roles.en]),
    [roles, fallbackRole]
  )
  const [activeRoles, setActiveRoles] = useState<string[]>(roleSource)
  const [pendingRoles, setPendingRoles] = useState<string[] | null>(null)
  const [roleIndex, setRoleIndex] = useState(0)
  const [roleCharIndex, setRoleCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasRoleRendered, setHasRoleRendered] = useState(false)

  useEffect(() => {
    if (areRoleListsEqual(activeRoles, roleSource)) return
    setPendingRoles(roleSource)
  }, [activeRoles, roleSource])

  useEffect(() => {
    setActiveRoles([fallbackRole || FALLBACK_HERO.roles.en])
    setPendingRoles(null)
    setRoleIndex(0)
    setRoleCharIndex(0)
    setIsDeleting(false)
  }, [languageKey, fallbackRole])

  useEffect(() => {
    if (!pendingRoles) return
    if (!isDeleting || roleCharIndex !== 0) return

    setActiveRoles(pendingRoles)
    setPendingRoles(null)
    setRoleIndex(0)
    setRoleCharIndex(0)
    setIsDeleting(false)
  }, [pendingRoles, isDeleting, roleCharIndex])

  useEffect(() => {
    const currentRole = activeRoles[roleIndex]
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
        setRoleIndex((roleIndex + 1) % activeRoles.length)
      }, 120)
    }

    return () => clearTimeout(timeout)
  }, [roleCharIndex, isDeleting, roleIndex, activeRoles])

  useEffect(() => {
    if (roleIndex < activeRoles.length) return
    setRoleIndex(0)
    setRoleCharIndex(0)
    setIsDeleting(false)
  }, [roleIndex, activeRoles.length])

  const displayRole = activeRoles[roleIndex]
    ? activeRoles[roleIndex].substring(0, roleCharIndex)
    : ''
  const showRolePlaceholder =
    activeRoles.length > 0 && !hasRoleRendered && displayRole.length === 0

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
  const nameText = profile?.name || FALLBACK_HERO.name
  const photo = profile?.photo || FALLBACK_HERO.photo
  const fallbackUniversityName =
    lang === 'it'
      ? FALLBACK_HERO.university.name.it
      : FALLBACK_HERO.university.name.en
  const university = {
    logo: profile?.university?.logo || FALLBACK_HERO.university.logo,
    name: profileLoading
      ? fallbackUniversityName
      : profile?.university?.name || fallbackUniversityName,
  }
  const socials =
    Array.isArray(profile?.socials) && profile.socials.length > 0
      ? orderHeroSocials(profile.socials)
      : orderHeroSocials(FALLBACK_HERO.socials)
  const roles =
    profileLoading || !Array.isArray(profile?.roles) ? EMPTY_ROLES : profile.roles
  const greeting = profileLoading ? t('hero.greeting') : profile?.greeting || t('hero.greeting')
  const fallbackRole =
    lang === 'it' ? FALLBACK_HERO.roles.it : FALLBACK_HERO.roles.en
  const uniName = university.name
  const portraitAlt = nameText || FALLBACK_HERO.name

  return (
    <section id="hero" className="hero-typing">
      <div className="hero-typing-container hero-animate">
        <HeroTypingAnimationText
          nameText={nameText}
          roles={roles}
          university={university}
          socials={socials}
          greeting={greeting}
          uniName={uniName}
          t={t}
          fallbackRole={fallbackRole}
          languageKey={lang}
        />
        <HeroPortrait
          photo={photo}
          alt={portraitAlt}
          contentReady={Boolean(photo)}
          ariaHidden={false}
        />
      </div>
    </section>
  )
}

export default HeroTyping
