const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // 1. CREATE - Insert new alert
  router.post("/", (req, res) => {
    const { sensor_id, alert_type, message, is_resolved } = req.body;

    if (!sensor_id || !alert_type || !message) {
      return res.status(400).json({ error: "sensor_id, alert_type, and message are required" });
    }

    const query = `
      INSERT INTO \`alerts/notification\` (sensor_id, alert_type, message, is_resolved, timestamp)
      VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(query, [sensor_id, alert_type, message, is_resolved || 0], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      res.json({ message: "Alert created", id: result.insertId });
    });
  });

  // 2. READ - Get all alerts
  router.get("/", (req, res) => {
    const query = "SELECT * FROM `alerts/notification` ORDER BY timestamp DESC";
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      res.json(results);
    });
  });

  // 3. READ - Get single alert by ID
  router.get("/:id", (req, res) => {
    const query = "SELECT * FROM `alerts/notification` WHERE id = ?";
    db.query(query, [req.params.id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(results[0]);
    });
  });

  // 4. UPDATE - Mark as resolved
  router.put("/:id/resolve", (req, res) => {
    const query = "UPDATE `alerts/notification` SET is_resolved = 1 WHERE id = ?";
    db.query(query, [req.params.id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json({ message: "Alert resolved" });
    });
  });

  return router;
};

