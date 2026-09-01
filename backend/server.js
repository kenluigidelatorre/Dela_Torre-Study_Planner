const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());


// ========================================
// GET ALL STUDY PLANS
// ========================================

app.get("/api/sessions", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM study_sessions
            ORDER BY session_date ASC, id DESC
        `);

        res.json(result.rows);

    } catch (error) {

        console.error("GET sessions error:", error);

        res.status(500).json({
            message: "Failed to fetch study plans."
        });
    }
});


// ========================================
// CREATE STUDY PLAN
// ========================================

app.post("/api/sessions", async (req, res) => {

    const {
        subject,
        topic,
        study_type,
        priority,
        duration_minutes,
        session_date,
        notes
    } = req.body;

    try {

        const result = await pool.query(
            `
            INSERT INTO study_sessions
            (
                subject,
                topic,
                study_type,
                priority,
                duration_minutes,
                session_date,
                notes,
                started,
                finished
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, FALSE, FALSE)
            RETURNING *
            `,
            [
                subject,
                topic || "",
                study_type || "",
                priority || "Medium",
                Number(duration_minutes) || 0,
                session_date,
                notes || ""
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error("POST sessions error:", error);

        res.status(500).json({
            message: "Failed to create study plan."
        });
    }
});


// ========================================
// UPDATE STUDY PLAN
// ========================================

app.put("/api/sessions/:id", async (req, res) => {

    const { id } = req.params;

    const {
        subject,
        topic,
        study_type,
        priority,
        duration_minutes,
        session_date,
        notes
    } = req.body;

    try {

        const result = await pool.query(
            `
            UPDATE study_sessions
            SET
                subject = $1,
                topic = $2,
                study_type = $3,
                priority = $4,
                duration_minutes = $5,
                session_date = $6,
                notes = $7
            WHERE id = $8
            RETURNING *
            `,
            [
                subject,
                topic || "",
                study_type || "",
                priority || "Medium",
                Number(duration_minutes) || 0,
                session_date,
                notes || "",
                id
            ]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Study plan not found."
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error("PUT sessions error:", error);

        res.status(500).json({
            message: "Failed to update study plan."
        });
    }
});


// ========================================
// START / FINISH / UNDO
// ========================================

app.patch("/api/sessions/:id", async (req, res) => {

    const { id } = req.params;

    const {
        started,
        finished
    } = req.body;

    try {

        const result = await pool.query(
            `
            UPDATE study_sessions
            SET
                started = COALESCE($1, started),
                finished = COALESCE($2, finished)
            WHERE id = $3
            RETURNING *
            `,
            [
                started !== undefined ? started : null,
                finished !== undefined ? finished : null,
                id
            ]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Study plan not found."
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error("PATCH sessions error:", error);

        res.status(500).json({
            message: "Failed to update study plan status."
        });
    }
});


// ========================================
// DELETE STUDY PLAN
// ========================================

app.delete("/api/sessions/:id", async (req, res) => {

    const { id } = req.params;

    try {

        const result = await pool.query(
            `
            DELETE FROM study_sessions
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Study plan not found."
            });
        }

        res.json({
            message: "Study plan deleted successfully."
        });

    } catch (error) {

        console.error("DELETE sessions error:", error);

        res.status(500).json({
            message: "Failed to delete study plan."
        });
    }
});


// ========================================
// ROOT
// ========================================

app.get("/", (req, res) => {
    res.send("StudyTracker API is running.");
});


// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(
        `Server is running on http://localhost:${PORT}`
    );
});