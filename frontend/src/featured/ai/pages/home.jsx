import { useRef, useState } from 'react'
import '../style/home.scss'
import { useAI } from "../hook/useai.js"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/hooks/useauth.js"
import Brand from '../../../components/Brand'

const Home = () => {
  const { generateinterviewreport, generating, loading, reports, fetchallreport } = useAI();
  const { user, handleLogout: logout } = useAuth();
  const [selfdescription, setSelfdescription] = useState("");
  const [jobdescription, setJobdescription] = useState("");
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [showReports, setShowReports] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (generating) return;
    setError("");

    const selectedResume = resumeFile || fileInputRef.current?.files?.[0];
    if (!selectedResume) {
      setError("Please upload your resume as a PDF.");
      return;
    }

    if (!selectedResume.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a valid PDF resume.");
      return;
    }

    if (selectedResume.size > 5 * 1024 * 1024) {
      setError("Your resume must be 5 MB or smaller.");
      return;
    }

    if (!jobdescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    if (!selfdescription.trim()) {
      setError("Please tell us about your background and experience.");
      return;
    }

    try {
      const report = await generateinterviewreport({ selfdescription, jobdescription, resumeFile: selectedResume });
      if (report?._id) {
        navigate(`/report/${report._id}`);
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to generate your interview report. Please try again.");
    }
  };

  const handleToggleReports = async () => {
    if (showReports) {
      setShowReports(false);
      return;
    }

    setReportsError("");
    try {
      await fetchallreport();
      setShowReports(true);
    } catch (requestError) {
      setReportsError(requestError?.response?.data?.message || "Unable to load your saved reports.");
    }
  };

  const handleProfileLogout = async () => {
    if (loggingOut) return;
    setLogoutError("");
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (requestError) {
      setLogoutError(requestError?.response?.data?.message || "Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <main className="home">
      <nav className="home__topbar" aria-label="Main navigation">
        <Brand />
        <div className="home__nav-actions">
          <a className="home__nav-link home__nav-link--active" href="#create-report">New interview</a>
          <button
            className="home__nav-link"
            type="button"
            onClick={handleToggleReports}
            disabled={loading}
            aria-expanded={showReports}
            aria-controls={showReports ? "saved-reports" : undefined}
          >
            {loading ? "Loading reports…" : "Saved reports"}
          </button>
        </div>
        <details className="home__profile">
          <summary className="home__profile-trigger" aria-label="Open profile menu">
            <span className="home__profile-name">{user?.username || "Account"}</span>
            <span className="home__account-avatar" aria-hidden="true">{(user?.username || "U").charAt(0).toUpperCase()}</span>
          </summary>
          <div className="home__profile-menu">
            <span className="home__profile-email">{user?.email}</span>
            <button type="button" onClick={handleProfileLogout} disabled={loggingOut}>
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
            {logoutError && <p role="alert">{logoutError}</p>}
          </div>
        </details>
      </nav>

      <section className="home__content" id="create-report" aria-labelledby="create-report-heading">
        <header className="home__heading">
          <h1 id="create-report-heading">Create Your Interview Report</h1>
          <p>Upload your resume and provide job details to get a personalized interview preparation report.</p>
        </header>

        <form className="home__form" onSubmit={handleGenerateReport}>
          <section className="home__field home__field--resume" aria-labelledby="resume-heading">
            <div className="home__field-heading">
              <span className="home__step" aria-hidden="true">01</span>
              <div>
                <h2 id="resume-heading">Resume</h2>
                <p>PDF only, up to 5 MB</p>
              </div>
            </div>
            <label
              className={`home__upload${resumeFile ? " home__upload--success" : ""}`}
              htmlFor="resume"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) {
                  setResumeFile(file);
                  setError("");
                }
              }}
            >
              <input
                ref={fileInputRef}
                className="home__file-input"
                type="file"
                name="resume"
                id="resume"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  setResumeFile(event.target.files?.[0] ?? null);
                  setError("");
                }}
              />
              <span className="home__upload-title" aria-live="polite">
                {resumeFile ? resumeFile.name : "Choose a PDF or drag it here"}
              </span>
              <span className="home__upload-hint">
                {resumeFile ? "Select to replace" : "Browse files"}
              </span>
            </label>
            {resumeFile && (
              <button
                className="home__remove-file"
                type="button"
                onClick={() => {
                  setResumeFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  setError("");
                }}
              >
                Remove file
              </button>
            )}
          </section>

          <section className="home__field" aria-labelledby="job-heading">
            <div className="home__field-heading">
              <span className="home__step" aria-hidden="true">02</span>
              <div><h2 id="job-heading">Job description</h2></div>
            </div>
            <label className="home__field-label" htmlFor="jobDescription">Job description</label>
            <textarea
              onChange={(event) => setJobdescription(event.target.value)}
              className="home__textarea"
              id="jobDescription"
              name="jobDescription"
              placeholder="Paste the job description here..."
              required
            />
          </section>

          <section className="home__field" aria-labelledby="self-heading">
            <div className="home__field-heading">
              <span className="home__step" aria-hidden="true">03</span>
              <div><h2 id="self-heading">Self description</h2></div>
            </div>
            <label className="home__field-label" htmlFor="selfDescription">About you</label>
            <textarea
              onChange={(event) => setSelfdescription(event.target.value)}
              className="home__textarea"
              id="selfDescription"
              name="selfDescription"
              placeholder="Tell us about your background, experience, skills and career goals..."
              required
            />
          </section>

          {error && <p className="home__error" role="alert">{error}</p>}
          <button className="home__generate" type="submit" disabled={generating} aria-busy={generating}>
            {generating ? "Generating report…" : "Generate Interview Report"}
          </button>
        </form>

        {reportsError && <p className="home__error" role="alert">{reportsError}</p>}
        {showReports && (
          <section className="home__history" id="saved-reports" aria-labelledby="history-heading">
            <div className="home__history-heading">
              <h2 id="history-heading">Saved reports</h2>
              <span>{reports.length} {reports.length === 1 ? "report" : "reports"}</span>
            </div>
            {reports.length ? (
              <div className="home__report-list">
                {reports.map((report) => (
                  <button
                    className="home__report-item"
                    key={report._id}
                    type="button"
                    onClick={() => navigate(`/report/${report._id}`)}
                  >
                    <span>
                      <strong>{report.title || "Interview preparation report"}</strong>
                      <small>
                        {report.matchscore != null ? `${report.matchscore}% role match` : "Interview report"}
                        {report.createdAt && ` · ${new Date(report.createdAt).toLocaleDateString()}`}
                      </small>
                    </span>
                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="home__empty-history">No saved reports yet.</p>
            )}
          </section>
        )}
      </section>
    </main>
  )
}

export default Home
