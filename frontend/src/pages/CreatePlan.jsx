import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const emptyForm = {
  subject: "",
  topic: "",
  study_type: "",
  priority: "Medium",
  hours: "",
  minutes: "",
  session_date: "",
  notes: "",
};

export default function CreatePlan() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hours = Number(formData.hours) || 0;
    const minutes = Number(formData.minutes) || 0;

    if (!formData.subject.trim()) {
      alert("Please enter a subject.");
      return;
    }

    if (minutes < 0 || minutes > 59) {
      alert("Minutes must be between 0 and 59.");
      return;
    }

    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes <= 0) {
      alert("Please enter a study duration.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        subject: formData.subject.trim(),
        topic: formData.topic.trim(),
        study_type: formData.study_type,
        priority: formData.priority,
        duration_minutes: totalMinutes,
        session_date: formData.session_date || null,
        notes: formData.notes.trim(),
      };

      const response = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Server error:", errorText);

        throw new Error("Failed to create study plan.");
      }


      // Go directly to Dashboard
      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      alert(
        "Failed to create study plan. Make sure your backend server is running.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-plan-page">
      <div className="create-plan-container">
        {/* HEADER */}
        <div className="page-header">
          <div className="eyebrow">NEW STUDY PLAN</div>

          <h1>Create Study Plan</h1>

          <p>Organize your next study session and set your learning goals.</p>
        </div>

        {/* FORM CARD */}
        <div className="plan-form-card glass-card">
          <form className="plan-form" onSubmit={handleSubmit}>
            {/* SUBJECT */}
            <div className="form-group">
              <label>
                Subject <span>*</span>
              </label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Programming"
                required
              />
            </div>

            {/* TOPIC */}
            <div className="form-group">
              <label>Topic</label>

              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g. React Hooks"
              />
            </div>

            {/* STUDY TYPE */}
            <div className="form-group">
              <label>Study Type</label>

              <select
                name="study_type"
                value={formData.study_type}
                onChange={handleChange}
              >
                <option value="">Select type</option>

                <option value="Review">Review</option>

                <option value="Practice">Practice</option>

                <option value="Reading">Reading</option>

                <option value="Project">Project</option>

                <option value="Exam Preparation">Exam Preparation</option>
              </select>
            </div>

            {/* PRIORITY */}
            <div className="form-group">
              <label>Priority</label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>

                <option value="Medium">Medium</option>

                <option value="High">High</option>
              </select>
            </div>

            {/* HOURS */}
            <div className="form-group">
              <label>Hours</label>

              <input
                type="number"
                min="0"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            {/* MINUTES */}
            <div className="form-group">
              <label>Minutes</label>

              <input
                type="number"
                min="0"
                max="59"
                name="minutes"
                value={formData.minutes}
                onChange={handleChange}
                placeholder="30"
              />
            </div>

            {/* DATE */}
            <div className="form-group full">
              <label>Study Date</label>

              <input
                type="date"
                name="session_date"
                value={formData.session_date}
                onChange={handleChange}
              />
            </div>

            {/* NOTES */}
            <div className="form-group full">
              <label>Notes</label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="What do you want to accomplish?"
                rows="5"
              />
            </div>

            {/* BUTTONS */}
            <div className="form-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/dashboard")}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
