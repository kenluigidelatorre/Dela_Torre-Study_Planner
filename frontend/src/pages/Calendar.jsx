import { useEffect, useState } from "react";

function Calendar() {
    const [sessions, setSessions] = useState([]);
    const [currentDate, setCurrentDate] = useState(
        new Date()
    );
    const [loading, setLoading] = useState(true);

    // ========================================
    // GET STUDY PLANS
    // ========================================

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/sessions"
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch study plans."
                    );
                }

                const data = await response.json();

                setSessions(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error(
                    "Calendar fetch error:",
                    error
                );

                setSessions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    // ========================================
    // DATE
    // ========================================

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(
        year,
        month,
        1
    ).getDay();

    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const monthName = currentDate.toLocaleString(
        "default",
        {
            month: "long",
        }
    );

    // ========================================
    // PREVIOUS MONTH
    // ========================================

    const previousMonth = () => {
        setCurrentDate(
            new Date(year, month - 1, 1)
        );
    };

    // ========================================
    // NEXT MONTH
    // ========================================

    const nextMonth = () => {
        setCurrentDate(
            new Date(year, month + 1, 1)
        );
    };

    // ========================================
    // GET PLANS FOR SPECIFIC DAY
    // ========================================

    const getSessionsForDay = (day) => {
        const date =
            `${year}-${String(month + 1).padStart(
                2,
                "0"
            )}-${String(day).padStart(2, "0")}`;

        return sessions.filter((session) => {
            if (!session.study_date) {
                return false;
            }

            return (
                String(session.study_date).slice(
                    0,
                    10
                ) === date
            );
        });
    };

    // ========================================
    // CREATE CALENDAR CELLS
    // ========================================

    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        cells.push(
            <div
                className="calendar-day empty"
                key={`empty-${i}`}
            />
        );
    }

    // Actual days
    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {
        const daySessions =
            getSessionsForDay(day);

        cells.push(
            <div
                className="calendar-day"
                key={day}
            >
                <div className="day-number">
                    {day}
                </div>

                <div className="calendar-sessions">
                    {daySessions.map(
                        (session) => (
                            <div
                                className="calendar-session"
                                key={session.id}
                            >
                                <strong>
                                    📚{" "}
                                    {session.subject}
                                </strong>

                                {session.topic && (
                                    <small>
                                        {
                                            session.topic
                                        }
                                    </small>
                                )}

                                {session.study_type && (
                                    <small>
                                        {
                                            session.study_type
                                        }
                                    </small>
                                )}

                                <small>
                                    ⏱{" "}
                                    {
                                        session.duration_minutes
                                    }{" "}
                                    min
                                </small>
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    }

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="calendar-page">
                <div className="loading-state">
                    Loading calendar...
                </div>
            </div>
        );
    }

    // ========================================
    // PAGE
    // ========================================

    return (
        <div className="calendar-page">

            {/* HEADER */}

            <div className="calendar-header">

                <div>
                    <div className="eyebrow">
                        YOUR SCHEDULE
                    </div>

                    <h1>
                        Study Calendar
                    </h1>

                    <p>
                        View your scheduled
                        study plans.
                    </p>
                </div>


                {/* MONTH NAVIGATION */}

                <div className="calendar-navigation">

                    <button
                        onClick={previousMonth}
                    >
                        ←
                    </button>

                    <h2>
                        {monthName} {year}
                    </h2>

                    <button
                        onClick={nextMonth}
                    >
                        →
                    </button>

                </div>

            </div>


            {/* CALENDAR */}

            <div className="calendar glass-card">

                {/* WEEKDAYS */}

                <div className="calendar-weekdays">

                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>

                </div>


                {/* DAYS */}

                <div className="calendar-grid">

                    {cells}

                </div>

            </div>

        </div>
    );
}


// ========================================
// IMPORTANT!
// ========================================

export default Calendar;