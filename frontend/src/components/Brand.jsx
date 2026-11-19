import { Link } from 'react-router-dom'

const Brand = ({ className = '' }) => (
  <Link className={`ux-brand ${className}`.trim()} to="/" aria-label="UdaanX home">
    <span className="ux-brand__mark" aria-hidden="true">U</span>
    <span className="ux-brand__name">Udaan<span>X</span></span>
  </Link>
)

export default Brand
