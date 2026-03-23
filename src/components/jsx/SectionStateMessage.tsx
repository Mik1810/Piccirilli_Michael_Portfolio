import { useLanguage } from '../../context/useLanguage'

interface SectionStateMessageProps {
  state: 'empty' | 'error'
  onRetry?: () => void
  className?: string
}

function SectionStateMessage({
  state,
  onRetry,
  className,
}: SectionStateMessageProps) {
  const { t } = useLanguage()
  const message =
    state === 'error' ? t('common.sectionError') : t('common.sectionEmpty')

  return (
    <div className={`section-state-message ${className || ''}`.trim()}>
      <p className="section-soft-fallback">{message}</p>
      {state === 'error' && onRetry ? (
        <button type="button" className="section-state-retry" onClick={onRetry}>
          {t('common.retry')}
        </button>
      ) : null}
    </div>
  )
}

export default SectionStateMessage
