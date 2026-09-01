import { useEffect, useState } from "react";

function Timer({ session, onClose, onFinish }) {
    const totalSeconds =
        Number(session?.duration_minutes || 0) * 60;

    const [timeLeft, setTimeLeft] = useState(totalSeconds);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }

        if (isPaused) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPaused, timeLeft]);

    // Automatically finish when timer reaches 0
    useEffect(() => {
        if (timeLeft === 0 && totalSeconds > 0) {
            if (onFinish) {
                onFinish(session.id);
            }
        }
    }, [timeLeft, totalSeconds, onFinish, session.id]);

    const hours = Math.floor(timeLeft / 3600);

    const minutes = Math.floor((timeLeft % 3600) / 60);

    const seconds = timeLeft % 60;

    const formatTime = (number) => {
        return String(number).padStart(2, "0");
    };

    const handlePause = () => {
        setIsPaused((prev) => !prev);
    };

    const handleFinish = () => {
        if (onFinish) {
            onFinish(session.id);
        }
    };

    return (
        <div className="timer-overlay">
            <div className="timer-modal">

                {/* CLOSE */}
                <button
                    className="timer-close"
                    onClick={onClose}
                    aria-label="Close timer"
                >
                    ×
                </button>

                {/* ICON */}
                <div className="timer-icon">
                    📚
                </div>

                {/* LABEL */}
                <div className="timer-label">
                    STUDY SESSION
                </div>

                {/* SUBJECT */}
                <h2>
                    {session.subject}
                </h2>

                {/* TOPIC */}
                {session.topic && (
                    <p className="timer-topic">
                        {session.topic}
                    </p>
                )}

                {/* TIMER */}
                <div className="timer-display">
                    {formatTime(hours)}:
                    {formatTime(minutes)}:
                    {formatTime(seconds)}
                </div>

                {/* STATUS */}
                <div className="timer-status">
                    {timeLeft === 0
                        ? "Study session completed!"
                        : isPaused
                        ? "Timer paused"
                        : "Focus on your studies"}
                </div>

                {/* BUTTONS */}
                <div className="timer-actions">

                    {timeLeft > 0 && (
                        <button
                            className="btn btn-primary"
                            onClick={handlePause}
                        >
                            {isPaused ? "Resume" : "Pause"}
                        </button>
                    )}

                    {timeLeft > 0 && (
                        <button
                            className="btn btn-secondary"
                            onClick={handleFinish}
                        >
                            Finish
                        </button>
                    )}

                </div>

                {/* CANCEL */}
                <button
                    className="timer-cancel"
                    onClick={onClose}
                >
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
}

export default Timer;