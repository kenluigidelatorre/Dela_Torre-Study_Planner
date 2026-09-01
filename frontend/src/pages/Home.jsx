import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleCreatePlan = () => {
    navigate("/dashboard?new=true");
  };

  const handleViewDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="eyebrow">WELCOME TO YOUR STUDY SPACE</div>

        <h1>
          Study smarter.
          <br />
          <span>Plan better.</span>
        </h1>

        <p className="home-description">
          Organize your study sessions, set your priorities,
          <br />
          and stay on track with your learning goals.
        </p>

        <div className="home-actions">
          <button
            className="btn btn-primary home-main-btn"
            onClick={handleCreatePlan}
          >
            + Create a Study Plan
          </button>

          <button
            className="btn btn-secondary home-main-btn"
            onClick={handleViewDashboard}
          >
            View Dashboard →
          </button>
        </div>
      </div>

      <div className="home-features">
        <div className="home-feature">
          <div className="feature-icon">📅</div>
          <h3>Plan Your Sessions</h3>
          <p>
            Schedule your study sessions and keep everything organized.
          </p>
        </div>

        <div className="home-feature">
          <div className="feature-icon">🎯</div>
          <h3>Set Priorities</h3>
          <p>
            Focus on what matters most with simple priority levels.
          </p>
        </div>

        <div className="home-feature">
          <div className="feature-icon">📈</div>
          <h3>Track Progress</h3>
          <p>
            Start your sessions, complete your plans, and track your progress.
          </p>
        </div>
      </div>
    </div>
  );
}