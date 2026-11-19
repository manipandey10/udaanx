import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useauth'
import Brand from '../../../components/Brand'
import LoadingState from '../../../components/LoadingState'

const Register = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("")
  const {loading,handleRegister} = useAuth()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const result = await handleRegister({username,email,password})
      navigate('/verify-email', { state: { email: result.email || email } })
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to reach the server. Check that the backend is running and try again.")
      if (requestError?.response?.data?.email) {
        setPendingVerificationEmail(requestError.response.data.email)
      }
    }

  }
  if(loading){
    return <LoadingState title="Creating your UdaanX account" description="Your interview preparation workspace is on its way." />
  }

  return (
    <main className="register-page">
      <Brand className="auth-brand" />
      <div className="auth-pitch">
        <p className="auth-pitch__eyebrow">PREPARE WITH PURPOSE</p>
        <h2>Your next<br />chapter<br />starts here.</h2>
        <p>Turn your experience into a clear, confident interview strategy.</p>
        <div className="auth-pitch__line" aria-hidden="true" />
      </div>
      <section className="register-card" aria-labelledby="register-title">
        <div className="register-card__heading">
          <span className="register-card__eyebrow">BEGIN WITH UDAANX</span>
          <h1 id="register-title">Create your account</h1>
          <p>Set up your space for more focused preparation.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && <p className="auth-form__error" role="alert">{error}</p>}
          {pendingVerificationEmail && (
            <Link
              className="register-card__verification-link"
              to="/verify-email"
              state={{ email: pendingVerificationEmail }}
            >
              Continue to email verification
            </Link>
          )}
          <div className="register-form__field">
            <label htmlFor="username">Username</label>
            <input
              onChange={(e)=>{setUsername(e.target.value)}}
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              autoComplete="username"
              required
            />
          </div>

          <div className="register-form__field">
            <label htmlFor="email">Email address</label>
            <input
              onChange={(e)=>{setEmail(e.target.value)}}
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="register-form__field">
            <label htmlFor="password">Password</label>
            <div className="register-form__password">
              <input
                onChange={(e)=>{setPassword(e.target.value)}}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
              <button
                className="register-form__password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit">Create account</button>
        </form>

        <p className="register-card__login">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register