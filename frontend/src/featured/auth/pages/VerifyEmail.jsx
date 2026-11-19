import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Brand from "../../../components/Brand"
import LoadingState from "../../../components/LoadingState"
import { useAuth } from "../hooks/useauth"

const VerifyEmail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { loading, handleVerifyEmail, handleResendVerification } = useAuth()
  const [email, setEmail] = useState(location.state?.email || "")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")
    try {
      await handleVerifyEmail({ email, otp })
      navigate("/", { replace: true })
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to verify your email. Please try again.")
    }
  }

  const handleResend = async () => {
    setError("")
    setMessage("")
    try {
      const result = await handleResendVerification({ email })
      setMessage(result.message)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to send a new verification code. Please try again.")
    }
  }

  if (loading) {
    return <LoadingState title="Verifying your email" description="Please wait while we secure your account." />
  }

  return (
    <main className="verify-email-page">
      <Brand className="auth-brand" />
      <section className="verify-email-card" aria-labelledby="verify-email-title">
        <p className="verify-email-card__eyebrow">ACCOUNT VERIFICATION</p>
        <h1 id="verify-email-title">Verify your email</h1>
        <p className="verify-email-card__description">
          Enter the six-digit code sent to your email address. The code expires after 10 minutes.
        </p>

        <form className="verify-email-form" onSubmit={handleSubmit}>
          {error && <p className="auth-form__error" role="alert">{error}</p>}
          {message && <p className="verify-email-form__success" role="status">{message}</p>}
          <div className="verify-email-form__field">
            <label htmlFor="verification-email">Email address</label>
            <input
              id="verification-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="verify-email-form__field">
            <label htmlFor="verification-code">Verification code</label>
            <input
              id="verification-code"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </div>
          <button type="submit">Verify email</button>
        </form>

        <button className="verify-email-resend" type="button" onClick={handleResend}>
          Send a new code
        </button>
        <p className="verify-email-card__login">
          Already verified? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}

export default VerifyEmail
