const express = require("express");
const router = express.Router();
module.exports = (db) => {
  // test route
  router.get("/", (req, res) => {
    res.send("Sensor API is working!");
  });

  // POST /sensor/data
  router.post("/data", (req, res) => {
    const { room, temperature } = req.body;

    if (!room || !temperature) {
      return res.status(400).json({ error: "room and temperature required" });
    }

    const query = "INSERT INTO sensors (room, temperature) VALUES (?, ?)";
    db.query(query, [room, temperature], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      res.json({ message: "Data inserted", id: result.insertId });
    });
  });

  return router;
};

