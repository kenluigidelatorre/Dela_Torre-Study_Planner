export default function About() {
  return (
    <div className="about-page">

      <div className="page-header">

        <div className="eyebrow">
          ABOUT STUDYTRACKER
        </div>

        <h1>
          Study with purpose.
        </h1>

        <p>
          StudyTracker is a simple study planning
          application designed to help students
          organize their study plans, manage their
          time, and track their progress.
        </p>

      </div>


      <div className="about-grid">

        <div className="glass-card about-card">

          <div className="about-icon">
            ✦
          </div>

          <h2>
            Plan
          </h2>

          <p>
            Create study plans with a subject,
            topic, study type, priority, duration,
            date, and notes.
          </p>

        </div>


        <div className="glass-card about-card">

          <div className="about-icon">
            ▶
          </div>

          <h2>
            Track
          </h2>

          <p>
            Start your study plans and monitor
            which sessions are currently in progress.
          </p>

        </div>


        <div className="glass-card about-card">

          <div className="about-icon">
            ✓
          </div>

          <h2>
            Improve
          </h2>

          <p>
            Finish completed plans and use Undo
            when you want to return to an active
            study session.
          </p>

        </div>

      </div>

    </div>
  );
}