import { useEffect, useMemo, useState } from "react";

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

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // EDIT ONLY
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // TIMER
  const [activeTimer, setActiveTimer] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // CALENDAR
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarPlan, setSelectedCalendarPlan] = useState(null);

  // ========================================
  // FETCH SESSIONS
  // ========================================

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions`);

      if (!response.ok) {
        throw new Error("Failed to fetch study plans.");
      }

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // ========================================
  // TIMER COUNTDOWN
  // ========================================

  useEffect(() => {
    if (!activeTimer || isPaused || remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimer, isPaused]);

  // ========================================
  // EDIT FORM
  // ========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openEditForm = (session) => {
    const totalMinutes = Number(session.duration_minutes) || 0;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    setEditingId(session.id);

    setFormData({
      subject: session.subject || "",
      topic: session.topic || "",
      study_type: session.study_type || "",
      priority: session.priority || "Medium",
      hours: hours || "",
      minutes: minutes || "",
      session_date: session.session_date
        ? session.session_date.substring(0, 10)
        : "",
      notes: session.notes || "",
    });

    setSelectedCalendarPlan(null);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // ========================================
  // UPDATE STUDY PLAN
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dashboard can ONLY edit.
    if (!editingId) {
      return;
    }

    const hours = Number(formData.hours) || 0;
    const minutes = Number(formData.minutes) || 0;

    if (!formData.subject.trim()) {
      alert("Please enter a subject.");
      return;
    }

    if (minutes > 59) {
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
        subject: formData.subject,
        topic: formData.topic,
        study_type: formData.study_type,
        priority: formData.priority,
        duration_minutes: totalMinutes,
        session_date: formData.session_date || null,
        notes: formData.notes,
      };

      const response = await fetch(`${API_URL}/api/sessions/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update study plan.");
      }

      await fetchSessions();
      closeForm();
    } catch (error) {
      console.error(error);
      alert("Failed to update study plan.");
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // START TIMER
  // ========================================

  const startSession = async (session) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          started: true,
          finished: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start study plan.");
      }

      const totalSeconds = (Number(session.duration_minutes) || 0) * 60;

      setActiveTimer(session);
      setRemainingSeconds(totalSeconds);
      setIsPaused(false);

      await fetchSessions();
    } catch (error) {
      console.error(error);
      alert("Failed to start study plan.");
    }
  };

  // ========================================
  // PAUSE / RESUME
  // ========================================

  const togglePause = () => {
    setIsPaused((previous) => !previous);
  };

  // ========================================
  // CANCEL TIMER
  // ========================================

  const cancelTimer = async () => {
    if (!activeTimer) return;

    try {
      await fetch(`${API_URL}/api/sessions/${activeTimer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          started: false,
          finished: false,
        }),
      });

      setActiveTimer(null);
      setRemainingSeconds(0);
      setIsPaused(false);

      await fetchSessions();
    } catch (error) {
      console.error(error);
      alert("Failed to cancel study session.");
    }
  };

  // ========================================
  // FINISH TIMER
  // ========================================

  const finishTimer = async () => {
    if (!activeTimer) return;

    try {
      const response = await fetch(
        `${API_URL}/api/sessions/${activeTimer.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            started: true,
            finished: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to finish study plan.");
      }

      setActiveTimer(null);
      setRemainingSeconds(0);
      setIsPaused(false);

      await fetchSessions();
    } catch (error) {
      console.error(error);
      alert("Failed to finish study plan.");
    }
  };

  // ========================================
  // UNDO
  // ========================================

  const undoFinish = async (session) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          started: false,
          finished: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to undo status.");
      }

      await fetchSessions();
    } catch (error) {
      console.error(error);
      alert("Failed to undo status.");
    }
  };

  // ========================================
  // DELETE
  // ========================================

  const deleteSession = async (id) => {
    const confirmDelete = window.confirm("Delete this study plan?");

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/sessions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete study plan.");
      }

      setSelectedCalendarPlan(null);

      await fetchSessions();
    } catch (error) {
      console.error(error);
      alert("Failed to delete study plan.");
    }
  };

  // ========================================
  // FORMAT TIMER
  // ========================================

  const formatTimer = (totalSeconds) => {
    const seconds = Math.max(0, Number(totalSeconds) || 0);

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    const remaining = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(remaining).padStart(2, "0")}`;
  };

  // ========================================
  // FORMAT DURATION
  // ========================================

  const formatDuration = (minutes) => {
    const mins = Number(minutes) || 0;

    const hours = Math.floor(mins / 60);
    const remainingMinutes = mins % 60;

    if (hours === 0) {
      return `${remainingMinutes} min`;
    }

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  };

  // ========================================
  // STATS
  // ========================================

  const totalMinutes = sessions.reduce(
    (total, session) => total + Number(session.duration_minutes || 0),
    0,
  );

  const finishedCount = sessions.filter((session) => session.finished).length;

  const pendingCount = sessions.length - finishedCount;

  const progressPercentage =
    sessions.length > 0
      ? Math.round((finishedCount / sessions.length) * 100)
      : 0;

  // ========================================
  // CALENDAR DATE HELPERS
  // ========================================

  const getLocalDateKey = (date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayKey = getLocalDateKey(new Date());

  // ========================================
  // STUDY STREAK
  // ========================================

  const studyStreak = useMemo(() => {
    const completedDates = sessions
      .filter((session) => session.finished && session.session_date)
      .map((session) => session.session_date.substring(0, 10));

    const uniqueDates = [...new Set(completedDates)].sort(
      (a, b) => new Date(b) - new Date(a),
    );

    if (uniqueDates.length === 0) {
      return 0;
    }

    let streak = 0;

    const checkDate = new Date();

    const today = getLocalDateKey(checkDate);

    if (!uniqueDates.includes(today)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateKey = getLocalDateKey(checkDate);

      if (!uniqueDates.includes(dateKey)) {
        break;
      }

      streak++;

      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }, [sessions]);

  // ========================================
  // TODAY'S PLANS
  // ========================================

  const todayPlans = sessions.filter((session) => {
    if (!session.session_date) {
      return false;
    }

    return session.session_date.substring(0, 10) === todayKey;
  });

  // ========================================
  // UPCOMING PLANS
  // ========================================

  const upcomingPlans = sessions
    .filter((session) => {
      if (!session.session_date || session.finished) {
        return false;
      }

      return session.session_date.substring(0, 10) > todayKey;
    })
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
    .slice(0, 3);

  // ========================================
  // SEARCH + FILTER
  // ========================================

  const filteredSessions = sessions.filter((session) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      session.subject?.toLowerCase().includes(search) ||
      session.topic?.toLowerCase().includes(search) ||
      session.study_type?.toLowerCase().includes(search) ||
      session.priority?.toLowerCase().includes(search) ||
      session.notes?.toLowerCase().includes(search);

    const matchesPriority =
      priorityFilter === "All" || session.priority === priorityFilter;

    let matchesStatus = true;

    if (statusFilter === "Not Started") {
      matchesStatus = !session.started && !session.finished;
    }

    if (statusFilter === "In Progress") {
      matchesStatus = session.started && !session.finished;
    }

    if (statusFilter === "Completed") {
      matchesStatus = session.finished;
    }

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // ========================================
  // CALENDAR
  // ========================================

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();

    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);

    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();

    const daysInMonth = lastDay.getDate();

    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const getSessionsForDate = (date) => {
    if (!date) return [];

    const dateKey = getLocalDateKey(date);

    return sessions.filter((session) => {
      if (!session.session_date) {
        return false;
      }

      return session.session_date.substring(0, 10) === dateKey;
    });
  };

  const changeMonth = (amount) => {
    setCurrentMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + amount, 1),
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">Loading your study plans...</div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="dashboard-page">
      {/* HEADER */}

      <div className="page-header">
        <div className="eyebrow">YOUR STUDY SPACE</div>

        <h1>Study Planner</h1>

        <p>
          Plan your study sessions, organize your learning goals, and keep track
          of your progress.
        </p>
      </div>

      {/* TODAY REMINDER */}

      {todayPlans.length > 0 && (
        <div className="study-reminder">
          <div className="reminder-icon">🔔</div>

          <div className="reminder-content">
            <strong>You have study plans today!</strong>

            <span>
              {todayPlans.length}{" "}
              {todayPlans.length === 1 ? "study plan" : "study plans"} scheduled
              for today.
            </span>
          </div>
        </div>
      )}

      {/* STATS */}

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-label">TOTAL PLANS</div>

          <div className="stat-value">{sessions.length}</div>

          <div className="stat-subtitle">Study plans created</div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-label">STUDY TIME</div>

          <div className="stat-value">{formatDuration(totalMinutes)}</div>

          <div className="stat-subtitle">Total planned study time</div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-label">COMPLETED</div>

          <div className="stat-value">{finishedCount}</div>

          <div className="stat-subtitle">{pendingCount} plans remaining</div>
        </div>

        {/* PROGRESS */}

        <div className="stat-card glass-card">
          <div className="stat-label">STUDY PROGRESS</div>

          <div className="progress-stat-value">{progressPercentage}%</div>

          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

          <div className="stat-subtitle">
            {finishedCount} of {sessions.length} plans completed
          </div>
        </div>

        {/* STREAK */}

        <div className="stat-card glass-card">
          <div className="stat-label">STUDY STREAK</div>

          <div className="streak-value">🔥 {studyStreak}</div>

          <div className="stat-subtitle">
            {studyStreak === 1
              ? "day of consistent studying"
              : "days of consistent studying"}
          </div>
        </div>
      </div>

      {/* UPCOMING */}

      {upcomingPlans.length > 0 && (
        <div className="upcoming-card glass-card">
          <div className="upcoming-header">
            <div>
              <div className="eyebrow">UPCOMING</div>

              <h3>Next Study Plans</h3>
            </div>
          </div>

          <div className="upcoming-list">
            {upcomingPlans.map((session) => (
              <div className="upcoming-item" key={session.id}>
                <div className="upcoming-info">
                  <strong>{session.subject}</strong>

                  {session.topic && <span>{session.topic}</span>}
                </div>

                <div className="upcoming-date">
                  📅 {new Date(session.session_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALENDAR */}

      <section className="calendar-section">
        <div className="calendar-card glass-card">
          <div className="calendar-header">
            <div>
              <div className="eyebrow">STUDY CALENDAR</div>

              <h2>{monthName}</h2>
            </div>

            <div className="calendar-controls">
              <button className="calendar-nav" onClick={() => changeMonth(-1)}>
                ‹
              </button>

              <button className="calendar-today" onClick={goToToday}>
                Today
              </button>

              <button className="calendar-nav" onClick={() => changeMonth(1)}>
                ›
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="calendar-grid">
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div key={`empty-${index}`} className="calendar-day empty" />
                );
              }

              const dateKey = getLocalDateKey(date);

              const daySessions = getSessionsForDate(date);

              const isToday = dateKey === todayKey;

              return (
                <div
                  key={dateKey}
                  className={`calendar-day ${isToday ? "today" : ""} ${
                    daySessions.length > 0 ? "has-plan" : ""
                  }`}
                >
                  <div className="calendar-day-number">{date.getDate()}</div>

                  <div className="calendar-plans">
                    {daySessions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        className={`calendar-plan ${
                          session.finished
                            ? "completed"
                            : session.started
                              ? "in-progress"
                              : ""
                        }`}
                        onClick={() => setSelectedCalendarPlan(session)}
                        title="View study plan"
                      >
                        <span>{session.subject}</span>

                        <small>
                          {formatDuration(session.duration_minutes)}
                        </small>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STUDY PLANS */}

      <section className="plans-section">
        <div className="section-header">
          <div>
            <h2>My Study Plans</h2>

            <div className="session-count">
              {filteredSessions.length}{" "}
              {filteredSessions.length === 1 ? "plan" : "plans"}
            </div>
          </div>

          <div className="section-tools">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="plan-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>

              <option value="High">High</option>

              <option value="Medium">Medium</option>

              <option value="Low">Low</option>
            </select>

            <select
              className="plan-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>

              <option value="Not Started">Not Started</option>

              <option value="In Progress">In Progress</option>

              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* EMPTY */}

        {filteredSessions.length === 0 ? (
          <div className="empty-state glass-card">
            <div className="empty-icon">✦</div>

            <h3>
              {searchTerm || priorityFilter !== "All" || statusFilter !== "All"
                ? "No plans found"
                : "No study plans yet"}
            </h3>

            <p>
              {searchTerm || priorityFilter !== "All" || statusFilter !== "All"
                ? "Try changing your search or filters."
                : "Go to Create Plan to add your first study plan."}
            </p>
          </div>
        ) : (
          <div className="session-list">
            {filteredSessions.map((session) => (
              <div
                className={`session-card glass-card ${
                  session.finished ? "session-completed" : ""
                }`}
                key={session.id}
              >
                <div className="session-main">
                  <div className="session-title">
                    <span
                      className={`status-dot ${
                        session.finished
                          ? "finished"
                          : session.started
                            ? "started"
                            : ""
                      }`}
                    />

                    <h3>{session.subject}</h3>
                  </div>

                  {session.topic && (
                    <div className="session-topic">{session.topic}</div>
                  )}

                  {session.notes && (
                    <div className="session-notes">{session.notes}</div>
                  )}

                  <div className="session-status">
                    {!session.started && !session.finished && (
                      <span className="status-badge not-started">
                        ○ Not Started
                      </span>
                    )}

                    {session.started && !session.finished && (
                      <span className="status-badge in-progress">
                        ◉ In Progress
                      </span>
                    )}

                    {session.finished && (
                      <span className="status-badge completed">
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  <div className="session-meta">
                    <span className="meta-tag">
                      ⏱ {formatDuration(session.duration_minutes)}
                    </span>

                    {session.session_date && (
                      <span className="meta-tag">
                        📅 {new Date(session.session_date).toLocaleDateString()}
                      </span>
                    )}

                    {session.study_type && (
                      <span className="meta-tag">📚 {session.study_type}</span>
                    )}

                    <span
                      className={`meta-tag priority-${(
                        session.priority || ""
                      ).toLowerCase()}`}
                    >
                      🎯 {session.priority}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="session-actions">
                  {!session.started && !session.finished && (
                    <button
                      className="btn btn-primary"
                      onClick={() => startSession(session)}
                    >
                      ▶ Start
                    </button>
                  )}

                  {session.started && !session.finished && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setActiveTimer(session);

                        if (remainingSeconds <= 0) {
                          setRemainingSeconds(
                            Number(session.duration_minutes) * 60,
                          );
                        }
                      }}
                    >
                      ⏱ Timer
                    </button>
                  )}

                  {session.finished && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => undoFinish(session)}
                    >
                      ↩ Undo
                    </button>
                  )}

                  {/* EDIT */}

                  <button
                    className="btn btn-secondary"
                    onClick={() => openEditForm(session)}
                  >
                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    className="btn btn-danger"
                    onClick={() => deleteSession(session.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================
          CALENDAR PLAN DETAILS MODAL
      ======================================== */}

      {selectedCalendarPlan && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCalendarPlan(null);
            }
          }}
        >
          <div className="calendar-plan-modal">
            <div className="modal-header">
              <div>
                <div className="eyebrow">STUDY PLAN</div>

                <h2>{selectedCalendarPlan.subject}</h2>

                <p>{selectedCalendarPlan.topic || "Study session details"}</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedCalendarPlan(null)}
              >
                ×
              </button>
            </div>

            <div className="calendar-plan-details">
              <div className="detail-item">
                <span>📚 Study Type</span>

                <strong>
                  {selectedCalendarPlan.study_type || "Not specified"}
                </strong>
              </div>

              <div className="detail-item">
                <span>🎯 Priority</span>

                <strong
                  className={`detail-priority priority-${(
                    selectedCalendarPlan.priority || ""
                  ).toLowerCase()}`}
                >
                  {selectedCalendarPlan.priority || "Medium"}
                </strong>
              </div>

              <div className="detail-item">
                <span>⏱ Duration</span>

                <strong>
                  {formatDuration(selectedCalendarPlan.duration_minutes)}
                </strong>
              </div>

              <div className="detail-item">
                <span>📅 Study Date</span>

                <strong>
                  {selectedCalendarPlan.session_date
                    ? new Date(
                        selectedCalendarPlan.session_date,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No date"}
                </strong>
              </div>

              <div className="detail-item full-detail">
                <span>📝 Notes</span>

                <div className="detail-notes">
                  {selectedCalendarPlan.notes || "No notes added."}
                </div>
              </div>

              <div className="detail-item full-detail">
                <span>📌 Status</span>

                <strong>
                  {selectedCalendarPlan.finished
                    ? "✓ Completed"
                    : selectedCalendarPlan.started
                      ? "◉ In Progress"
                      : "○ Not Started"}
                </strong>
              </div>
            </div>

            <div className="calendar-modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => openEditForm(selectedCalendarPlan)}
              >
                Edit Plan
              </button>

              <button
                className="btn btn-danger"
                onClick={() => deleteSession(selectedCalendarPlan.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          EDIT PLAN MODAL
      ======================================== */}

      {showForm && editingId && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeForm();
            }
          }}
        >
          <div className="plan-modal">
            <div className="modal-header">
              <div>
                <h2>Edit Study Plan</h2>

                <p>Update your study session.</p>
              </div>

              <button
                className="modal-close"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form className="plan-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject *</label>

                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Programming"
                />
              </div>

              <div className="form-group">
                <label>Topic</label>

                <input
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g. React Hooks"
                />
              </div>

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

              <div className="form-group full">
                <label>Study Date</label>

                <input
                  type="date"
                  name="session_date"
                  value={formData.session_date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full">
                <label>Notes</label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="What do you want to accomplish?"
                />
              </div>

              <div className="form-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          TIMER MODAL
      ======================================== */}

      {activeTimer && (
        <div
          className="timer-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cancelTimer();
            }
          }}
        >
          <div className="timer-modal">
            <button className="timer-close" onClick={cancelTimer}>
              ×
            </button>

            <div className="timer-icon">⏱️</div>

            <div className="timer-label">STUDY SESSION</div>

            <h2>{activeTimer.subject}</h2>

            {activeTimer.topic && (
              <p className="timer-topic">{activeTimer.topic}</p>
            )}

            <div className="timer-display">{formatTimer(remainingSeconds)}</div>

            <p className="timer-status">
              {remainingSeconds === 0
                ? "Time's up!"
                : isPaused
                  ? "Study session paused"
                  : "Study session in progress"}
            </p>

            <div className="timer-actions">
              <button
                className="btn btn-secondary"
                onClick={togglePause}
                disabled={remainingSeconds === 0}
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>

              <button className="btn btn-primary" onClick={finishTimer}>
                ✓ Finish
              </button>
            </div>

            <button className="timer-cancel" onClick={cancelTimer}>
              Cancel Study
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
