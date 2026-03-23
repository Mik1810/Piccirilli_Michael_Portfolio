import { useContent } from '../../context/useContent'
import { useLanguage } from '../../context/useLanguage'
import { useProfile } from '../../context/useProfile'
import '../css/About.css'
import SectionStateMessage from './SectionStateMessage'

function About() {
  const { t } = useLanguage()
  const { about, sectionsLoading, sectionsStatus, refreshContent } = useContent()
  const { profile, loading: profileLoading } = useProfile()
  const interests = about?.interests || []
  const bio = String(profile?.bio || '').trim()
  const showBioSkeleton = profileLoading && bio.length === 0
  const showInterestsSkeleton = sectionsLoading.about && interests.length === 0

  return (
    <section id="about" className="about">
      <div className="section-container">
        <h2 className="section-title reveal">{t('about.title')}</h2>
        <p className="section-subtitle reveal reveal-delay-1">
          {t('about.subtitle')}
        </p>
        <div className="about-content reveal reveal-delay-2">
          <div className="about-bio">
            {showBioSkeleton ? (
              <div className="about-skeleton-copy" aria-hidden="true">
                <span
                  className="ui-skeleton ui-skeleton-line"
                  style={{ width: '100%', height: '16px' }}
                />
                <span
                  className="ui-skeleton ui-skeleton-line"
                  style={{ width: '96%', height: '16px' }}
                />
                <span
                  className="ui-skeleton ui-skeleton-line"
                  style={{ width: '88%', height: '16px' }}
                />
                <span
                  className="ui-skeleton ui-skeleton-line"
                  style={{ width: '72%', height: '16px' }}
                />
              </div>
            ) : bio.length > 0 ? (
              <p>{bio}</p>
            ) : null}
            <div className="about-interests">
              {showInterestsSkeleton
                ? Array.from({ length: 6 }, (_, index) => (
                    <span
                      key={`about-skeleton-${index}`}
                      className="ui-skeleton ui-skeleton-chip"
                      aria-hidden="true"
                    />
                  ))
                : interests.length > 0
                  ? interests.map((interest) => (
                    <span key={interest} className="about-interest-tag">
                      {interest}
                    </span>
                    ))
                  : (
                    <SectionStateMessage
                      state={sectionsStatus.about === 'error' ? 'error' : 'empty'}
                      onRetry={refreshContent}
                    />
                  )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
