// Props: sessions array, onDelete callback
import SessionItem from "./SessionItem";

export default function SessionList({ sessions, onDelete }) {
  if (sessions.length === 0) return <p>No sessions logged yet.</p>;

  return (
    <ul>
      {sessions.map((s) => (
        <SessionItem key={s.id} session={s} onDelete={onDelete} />
      ))}
    </ul>
  );
}