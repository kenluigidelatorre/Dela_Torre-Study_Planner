import { useState } from "react";

export default function SessionForm({ onAdd, submitting }) {
  const [subject, setSubject] = useState("Programming");
  const [topic, setTopic] = useState("");
  const [studyType, setStudyType] = useState("Coding");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const totalMinutes =
      Number(hours || 0) * 60 + Number(minutes || 0);

    if (!subject.trim()) return;

    if (totalMinutes <= 0) {
      alert("Please enter a valid study duration.");
      return;
    }

    onAdd({
      subject,
      topic,
      study_type: studyType,
      duration_minutes: totalMinutes,
      session_date: date,
      notes,
    });

    setTopic("");
    setHours("");
    setMinutes("");
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Programming"
        />
      </div>

      <div>
        <label>Topic / Task</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. React Components"
        />
      </div>

      <div>
        <label>Study Type</label>
        <select
          value={studyType}
          onChange={(e) => setStudyType(e.target.value)}
        >
          <option value="Coding">Coding</option>
          <option value="Review">Review</option>
          <option value="Lecture">Lecture</option>
          <option value="Assignment">Assignment</option>
          <option value="Reading">Reading</option>
          <option value="Practice">Practice</option>
          <option value="Research">Research</option>
        </select>
      </div>

      <div>
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <label>Study Duration</label>

        <div>
          <input
            type="number"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Hours"
          />

          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Minutes"
          />
        </div>
      </div>

      <div>
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you learn or accomplish?"
          rows="4"
        />
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Add Study Session"}
      </button>
    </form>
  );
}