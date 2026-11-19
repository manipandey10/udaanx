import { useEffect, useState } from 'react'
import '../style/interview.scss'
import { useAI } from '../hook/useai'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useauth'
import Brand from '../../../components/Brand'
import LoadingState from '../../../components/LoadingState'

const reportSections = [
  {
    id: 'technical',
    label: 'Technical Questions',
    icon: '</>',
    description: 'Role-specific questions to help you prepare for the technical round.',
  },
  {
    id: 'behavioral',
    label: 'Behaviour Questions',
    icon: '✳',
    description: 'Practice prompts to help you share your experience with confidence.',
  },
  {
    id: 'skills',
    label: 'Skill Gap',
    icon: '◈',
    description: 'See which skills to strengthen for the role you are targeting.',
  },
  {
    id: 'preparation',
    label: 'Preparation Plan',
    icon: '▤',
    description: 'Follow a clear plan to make the most of your interview preparation.',
  },
  {
    id: 'profile',
    label: 'Application Snapshot',
    icon: '◎',
    description: 'Review the resume and application details used to create this report.',
  },
]

const Interview = () => {
  const { interviewreport, loading, fetchreportbyid, generateinterviewpdf } = useAI();
  const { user } = useAuth();
  const { interviewId } = useParams();
  const [activeSection, setActiveSection] = useState(reportSections[0])
  const [reportResult, setReportResult] = useState(null)
  const [pdfError, setPdfError] = useState("")
  const username = user?.username || 'there'

  useEffect(() => {
    let active = true;
    fetchreportbyid(interviewId).then((report) => {
      if (active) {
        setReportResult({id: interviewId, report});
      }
    }).catch((requestError) => {
      if (active) {
        setReportResult({
          id: interviewId,
          error: requestError.response?.data?.message || "Unable to load this interview report."
        });
      }
    });

    return () => {
      active = false;
    };
  }, [fetchreportbyid, interviewId])

  const report = reportResult?.id === interviewId ? reportResult.report : null
  const error = reportResult?.id === interviewId ? reportResult.error : null
  const score = Number(report?.matchscore)
  const hasMatchScore = report?.matchscore != null && Number.isFinite(score)
  const scorePercentage = hasMatchScore ? Math.min(100, Math.max(0, score)) : 0
  const sectionContent = {
    technical: report?.technicalquestion,
    behavioral: report?.behavioralquestion,
    skills: report?.skillgap,
    preparation: report?.preparationplan,
    profile: null,
  }[activeSection.id]
  const handlePdfDownload = async () => {
    setPdfError("");
    try {
      await generateinterviewpdf(interviewId);
    } catch (requestError) {
      setPdfError(requestError?.response?.data?.message || "Unable to create your tailored resume PDF. Please try again.");
    }
  };

  if ((loading && !interviewreport) || reportResult?.id !== interviewId) {
    return <LoadingState title="Loading your interview report" description="Gathering your questions, insights, and preparation plan..." />
  }

  if (error) {
    return <main className="interview-page"><p role="alert">{error}</p></main>
  }

  if (!report) {
    return <main className="interview-page"><p role="alert">Interview report not found.</p></main>
  }

  return (
    <main className="interview-page">
      <aside className="interview-sidebar" aria-label="Interview report navigation">
        <Brand className="interview-brand" />
        <div className="interview-sidebar__label">YOUR REPORT</div>
        <nav className="interview-nav" aria-label="Report sections">
          {reportSections.map((section, index) => (
            <button
              className={`interview-nav__item${activeSection.id === section.id ? ' is-active' : ''}`}
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section)}
              aria-current={activeSection.id === section.id ? 'page' : undefined}
            >
              <span className="interview-nav__icon" aria-hidden="true">{section.icon}</span>
              <span className="interview-nav__text">{section.label}</span>
              <span className="interview-nav__number">0{index + 1}</span>
            </button>
          ))}
          <button
            className="interview-nav__item "
            type="button"
            onClick={handlePdfDownload}
            disabled={loading}
          >
            <span className="interview-nav__icon" aria-hidden="true">📄</span>
            <span className="interview-nav__text">{loading ? "Preparing PDF..." : "Download resume"}</span>
          </button>
        </nav>
        {pdfError && <p className="interview-sidebar__error" role="alert">{pdfError}</p>}
      </aside>

      <section className="interview-content">
        <header className="interview-welcome">
          <div>
            <p className="interview-welcome__eyebrow">UDAANX INTERVIEW STUDIO</p>
            <h1>Ready for what’s next, {username}<span className="interview-welcome__wave" aria-hidden="true"> ✦</span></h1>
            <p className="interview-welcome__message">
              Your personalized preparation plan, all in one place.
            </p>
          </div>
          <div className="interview-welcome__avatar" aria-hidden="true">
            {username.charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="interview-content__body">
          <div className="interview-content__section-label">INTERVIEW REPORT</div>
          <article className="interview-report-card" aria-live="polite">
            <div className="interview-report-card__overview">
              <div className="interview-report-card__title">
                <p className="interview-report-card__eyebrow">YOUR INTERVIEW BRIEF</p>
                <h2>{report.title || 'Interview preparation report'}</h2>
                <p className="interview-report-card__description">A focused view of your role, strengths, and next steps.</p>
              </div>
              <div
                className="interview-match-score"
                style={{ '--match-score': `${scorePercentage}%` }}
                role="img"
                aria-label={hasMatchScore ? `${scorePercentage}% role match` : 'Role match score unavailable'}
              >
                <span>{hasMatchScore ? `${scorePercentage}%` : 'N/A'}</span>
                <small>ROLE MATCH</small>
              </div>
            </div>
            <div className="interview-report-card__section-heading">
              <div className="interview-report-card__icon" aria-hidden="true">
                {activeSection.icon}
              </div>
              <div>
                <p className="interview-report-card__eyebrow">REPORT SECTION</p>
                <h3>{activeSection.label}</h3>
                <p className="interview-report-card__description">{activeSection.description}</p>
              </div>
            </div>
            <div className="interview-report-card__placeholder">
              {activeSection.id === 'profile' ? (
                <div className="interview-profile">
                  <section>
                    <h4>Target job</h4>
                    <p>{report.jobdescription || "No job description was saved for this report."}</p>
                  </section>
                  <section>
                    <h4>About you</h4>
                    <p>{report.selfdescription || "No candidate description was saved for this report."}</p>
                  </section>
                  <details>
                    <summary>Resume text used</summary>
                    <p>{report.resume || "No resume text is available for this report."}</p>
                  </details>
                </div>
              ) : sectionContent?.length ? (
                <ul>
                  {sectionContent.map((item, index) => (
                    <li
                      className={`interview-report-list-item${activeSection.id === 'technical' || activeSection.id === 'behavioral' ? ' interview-question-card' : ` interview-report-list-item--${activeSection.id}`}`}
                      key={`${activeSection.id}-${index}`}
                    >
                      {activeSection.id === 'technical' || activeSection.id === 'behavioral' ? (
                        <>
                          <section className="interview-question-card__section interview-question-card__question">
                            <div className="interview-question-card__label">
                              <span aria-hidden="true">?</span>
                              QUESTION
                            </div>
                            <h4>{item.question}</h4>
                          </section>
                          <section className="interview-question-card__section interview-question-card__intention">
                            <div className="interview-question-card__label">
                              <span aria-hidden="true">◎</span>
                              WHY IS THIS QUESTION ASKED?
                            </div>
                            <p>{item.intention}</p>
                          </section>
                          <section className="interview-question-card__section interview-question-card__answer">
                            <div className="interview-question-card__label">
                              <span aria-hidden="true">✦</span>
                              RECOMMENDED ANSWER
                            </div>
                            <p>{item.answer}</p>
                          </section>
                        </>
                      ) : activeSection.id === 'skills' ? (
                        <div className="interview-skill-row">
                          <strong>{item.skill}</strong>
                          <span className={`interview-skill-severity interview-skill-severity--${item.severity?.toLowerCase() || 'unknown'}`}>
                            {item.severity}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="interview-plan-day">
                            <span>DAY {item.day}</span>
                            <strong>{item.focus}</strong>
                          </div>
                          {item.tasks && <p className="interview-plan-tasks">{item.tasks}</p>}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No {activeSection.label.toLowerCase()} are available in this report.</p>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

export default Interview
