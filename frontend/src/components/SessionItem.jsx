export default function SessionItem({ session, onDelete }) {
  const hours = Math.floor(session.duration_minutes / 60);
  const minutes = session.duration_minutes % 60;

  let durationText = "";

  if (hours > 0) {
    durationText += `${hours} hr`;
  }

  if (minutes > 0) {
    durationText += `${hours > 0 ? " " : ""}${minutes} min`;
  }

  return (
    <li>
      <h3>{session.subject}</h3>

      {session.topic && (
        <p>
          <strong>Topic:</strong> {session.topic}
        </p>
      )}

      {session.study_type && (
        <p>
          <strong>Type:</strong> {session.study_type}
        </p>
      )}

      <p>
        <strong>Date:</strong> {session.session_date}
      </p>

      <p>
        <strong>Duration:</strong> {durationText}
      </p>

      {session.notes && (
        <p>
          <strong>Notes:</strong> {session.notes}
        </p>
      )}

      <button onClick={() => onDelete(session.id)}>
        Delete
      </button>
    </li>
  );
}