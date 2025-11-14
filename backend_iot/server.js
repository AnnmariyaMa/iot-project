const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2004",
  database: "iot_office",
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MariaDB!");
});

// Import routes
const sensorRoutes = require("./routes/sensor");
app.use("/sensor", sensorRoutes(db));

const roomGroupRoutes = require("./routes/roomGroups");
app.use("/room-groups", roomGroupRoutes(db));

const roomRoutes = require("./routes/rooms");
app.use("/rooms", roomRoutes(db));

const deviceStatusRoutes = require("./routes/deviceStatus");
app.use("/device-status", deviceStatusRoutes(db));

const alertRoutes = require("./routes/alerts");
app.use("/alerts", alertRoutes(db));

const sensorReadingsRoutes = require("./routes/sensorReadings");
app.use("/sensor-readings", sensorReadingsRoutes(db));

// Test route
app.get("/", (req, res) => {
  res.send("Hello IoT Project!");
});
// tes sensor route
app.use("/sensor-reading",sensorReadingsRoutes(db))

// ---------------- Auto Sensor Data Generation ----------------
const TEMP_THRESHOLD = 35;     // match your thresholds
const HUMIDITY_THRESHOLD = 50;

function generateRandomReading(sensor_id) {
  const temperature = parseFloat((25 + Math.random() * 25).toFixed(1)); // 20-45°C
  const humidity = parseFloat((25 + Math.random() * 60).toFixed(1));    // 20-80%

  const query = `
    INSERT INTO sensor_readings (sensor_id, timestamp, temperature, humidity)
    VALUES (?, NOW(), ?, ?)
  `;

  db.query(query, [sensor_id, temperature, humidity], (err) => {
    if (err) return console.error(err);

    // Alert check
    if (temperature > TEMP_THRESHOLD || humidity > HUMIDITY_THRESHOLD) {
      console.log(
        `⚠️ Alert! Sensor ${sensor_id} reading exceeded threshold: Temp=${temperature}, Humidity=${humidity}`
      );
      // Optionally, insert into alerts table
      const alertQuery = `
        INSERT INTO \`alerts/notification\` (sensor_id, alert_type, message, is_resolved, timestamp)
        VALUES (?, ?, ?, 0, NOW())
      `;
      let type = temperature > TEMP_THRESHOLD ? "Temperature" : "Humidity";
      let msg = `${type} exceeded threshold! Temp=${temperature}, Humidity=${humidity}`;
      db.query(alertQuery, [sensor_id, type, msg], (err) => {
        if (err) console.error(err);
      });
    }
  });
}

// Run every 10 seconds
setInterval(() => {
  db.query("SELECT sensor_id FROM sensors", (err, sensors) => {
    if (err) return console.error(err);

    sensors.forEach((sensor) => {
      generateRandomReading(sensor.sensor_id);
    });
  });
}, 100000); // 10 seconds interval
// ---------------------------------------------------------------

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

// kannin vathil charathe kanna ninne kadotte innaloru mutham njan thannote aararoo aareroo aarareero aariraro 

