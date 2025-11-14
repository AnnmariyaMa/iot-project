const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // ✅ GET all device statuses
  router.get("/", (req, res) => {
    const query = `
      SELECT ds.status_id, ds.sensor_id, s.sensor_name, ds.last_seen,
             ds.battery_level, ds.is_online
      FROM device_status ds
      JOIN sensors s ON ds.sensor_id = s.sensor_id
    `;
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // ✅ GET status for a specific sensor
  router.get("/:sensor_id", (req, res) => {
    const query = `
      SELECT ds.status_id, ds.sensor_id, s.sensor_name, ds.last_seen,
             ds.battery_level, ds.is_online
      FROM device_status ds
      JOIN sensors s ON ds.sensor_id = s.sensor_id
      WHERE ds.sensor_id = ?
      ORDER BY ds.last_seen DESC
      LIMIT 1
    `;
    db.query(query, [req.params.sensor_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ message: "No status found for this sensor" });
      res.json(results[0]);
    });
  });

  // ✅ POST new device status
  router.post("/", (req, res) => {
    const { sensor_id, last_seen, battery_level, is_online } = req.body;

    if (!sensor_id || !last_seen || battery_level == null || is_online == null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // check if sensor exists
    const checkSensor = "SELECT * FROM sensors WHERE sensor_id = ?";
    db.query(checkSensor, [sensor_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) {
        return res.status(400).json({ error: "Invalid sensor_id" });
      }

      const query = `
        INSERT INTO device_status (sensor_id, last_seen, battery_level, is_online)
        VALUES (?, ?, ?, ?)
      `;
      db.query(query, [sensor_id, last_seen, battery_level, is_online], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Device status added", id: result.insertId });
      });
    });
  });

  // ✅ PUT update status (by status_id)
  router.put("/:id", (req, res) => {
    const { sensor_id, last_seen, battery_level, is_online } = req.body;

    const query = `
      UPDATE device_status
      SET sensor_id = ?, last_seen = ?, battery_level = ?, is_online = ?
      WHERE status_id = ?
    `;
    db.query(query, [sensor_id, last_seen, battery_level, is_online, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Status not found" });
      res.json({ message: "Device status updated" });
    });
  });

  // ✅ DELETE status
  router.delete("/:id", (req, res) => {
    const query = "DELETE FROM device_status WHERE status_id = ?";
    db.query(query, [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Status not found" });
      res.json({ message: "Device status deleted" });
    });
  });

  return router;
};
