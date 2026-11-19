import Brand from './Brand'

const LoadingState = ({
  eyebrow = 'UDAANX',
  title,
  description,
  children,
}) => (
  <main className="loading-state" role="status" aria-live="polite">
    <Brand />
    <span className="loading-state__orbit" aria-hidden="true">
      <span />
    </span>
    <p className="loading-state__eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    {description && <p className="loading-state__description">{description}</p>}
    {children}
  </main>
)

export default LoadingState
