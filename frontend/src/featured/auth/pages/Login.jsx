import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useauth'
import Brand from '../../../components/Brand'
import LoadingState from '../../../components/LoadingState'

const Login = () => {
  const navigate = useNavigate()
  const {loading,handleLogin} =  useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [unverifiedEmail, setUnverifiedEmail] = useState("")



  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setUnverifiedEmail("")
    try {
      await handleLogin({email,password})
      navigate('/')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to reach the server. Check that the backend is running and try again.")
      if (requestError?.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email)
      }
    }
  }
  if(loading){
    return <LoadingState title="Preparing your UdaanX workspace" description="Getting your account ready..." />
  }

  return (
    <main className="login-page">
      <Brand className="auth-brand" />
      <div className="auth-pitch">
        <p className="auth-pitch__eyebrow">YOUR NEXT OPPORTUNITY STARTS HERE</p>
        <h2>Walk in<br />ready.</h2>
        <p>Practice with a plan built around your experience and the role ahead.</p>
        <div className="auth-pitch__line" aria-hidden="true" />
      </div>
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card__heading">
          <span className="login-card__eyebrow">WELCOME TO UDAANX</span>
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in to continue preparing for what’s next.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="auth-form__error" role="alert">{error}</p>}
          {unverifiedEmail && (
            <Link
              className="login-card__verification-link"
              to="/verify-email"
              state={{ email: unverifiedEmail }}
            >
              Resend verification code
            </Link>
          )}
          <div className="login-form__field">
            <label htmlFor="email">Email address</label>
            <input
              onChange={(e) => {setEmail(e.target.value)}}
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-form__field">
            <label htmlFor="password">Password</label>
            <div className="login-form__password">
              <input
                onChange={(e) => {setPassword(e.target.value)}}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                className="login-form__password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit">Sign in</button>
          <p className="login-card__register">Don’t have an account?<Link to="/register">Register</Link></p>
        </form>
      </section>
    </main>
  )
}

export default Login