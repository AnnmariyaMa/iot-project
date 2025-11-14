const express = require("express");
const router = express.Router();

// ------------------- Thresholds -------------------
const TEMP_THRESHOLD = 35;       // degrees Celsius
const HUMIDITY_THRESHOLD = 50;   // percent
// --------------------------------------------------

module.exports = (db) => {
  // 1. CREATE - insert a new sensor reading
  router.post("/", (req, res) => {
  const { sensor_id, temperature, humidity } = req.body;

  if (!sensor_id || temperature === undefined || humidity === undefined) {
    return res.status(400).json({ error: "sensor_id, temperature, and humidity are required" });
  }

  const query = `
    INSERT INTO sensor_readings (sensor_id, timestamp, temperature, humidity)
    VALUES (?, NOW(), ?, ?)
  `;

  db.query(query, [sensor_id, temperature, humidity], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // ---------------- Alert logic ----------------
    if (temperature > TEMP_THRESHOLD || humidity > HUMIDITY_THRESHOLD) {
      console.log(`⚠️ Alert! Sensor ${sensor_id} reading exceeded threshold: Temp=${temperature}, Humidity=${humidity}`);
    }
    // --------------------------------------------

    res.json({ message: "Sensor reading added", id: result.insertId });
  });
});

  // 2. READ - all readings
  router.get("/", (req, res) => {
    const query = "SELECT * FROM sensor_readings ORDER BY timestamp DESC";
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // 3. READ - latest reading for one sensor
  router.get("/latest/:sensor_id", (req, res) => {
    const query = `
      SELECT * FROM sensor_readings 
      WHERE sensor_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    db.query(query, [req.params.sensor_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: "No readings found" });
      res.json(results[0]);
    });
  });

  // 4. READ - readings by sensor (all history)
  router.get("/sensor/:sensor_id", (req, res) => {
    const query = "SELECT * FROM sensor_readings WHERE sensor_id = ? ORDER BY timestamp DESC";
    db.query(query, [req.params.sensor_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // 5. GET readings from the last X hours
router.get("/last/:hours", (req, res) => {
  const hours = parseInt(req.params.hours);

  if (isNaN(hours) || hours <= 0) {
    return res.status(400).json({ error: "Hours must be a positive number" });
  }

  const query = `
    SELECT * FROM sensor_readings
    WHERE timestamp >= NOW() - INTERVAL ? HOUR
    ORDER BY timestamp DESC
  `;

  db.query(query, [hours], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 6. GET average temperature/humidity per hour for a sensor
router.get("/average/:sensor_id/:hours", (req, res) => {
  const sensor_id = parseInt(req.params.sensor_id);
  const hours = parseInt(req.params.hours);

  if (isNaN(sensor_id) || isNaN(hours) || hours <= 0) {
    return res.status(400).json({ error: "Sensor ID and hours must be positive numbers" });
  }

  const query = `
    SELECT 
      DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') AS hour,
      AVG(temperature) AS avg_temperature,
      AVG(humidity) AS avg_humidity
    FROM sensor_readings
    WHERE sensor_id = ? AND timestamp >= NOW() - INTERVAL ? HOUR
    GROUP BY hour
    ORDER BY hour DESC
  `;

  db.query(query, [sensor_id, hours], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});


  return router;
};
 router.get ("/average/:sensor_id/:hours",(req, res) => {

 })

