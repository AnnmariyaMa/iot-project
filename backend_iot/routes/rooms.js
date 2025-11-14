const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // ✅ GET all rooms
  router.get("/", (req, res) => {
    const query = `
      SELECT r.room_id, r.room_name, r.floor_number, r.description,
             g.group_name AS room_group
      FROM rooms r
      JOIN room_groups g ON r.room_group_id = g.room_group_id
    `;
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // ✅ GET one room by ID
  router.get("/:id", (req, res) => {
    const query = `
      SELECT r.room_id, r.room_name, r.floor_number, r.description,
             g.group_name AS room_group
      FROM rooms r
      JOIN room_groups g ON r.room_group_id = g.room_group_id
      WHERE r.room_id = ?
    `;
    db.query(query, [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ message: "Room not found" });
      res.json(results[0]);
    });
  });

  // ✅ POST new room (with validation for room_group_id)
  router.post("/", (req, res) => {
    const { room_group_id, room_name, floor_number, description } = req.body;

    if (!room_group_id || !room_name || !floor_number || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // check if group exists
    const checkGroup = "SELECT * FROM room_groups WHERE room_group_id = ?";
    db.query(checkGroup, [room_group_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) {
        return res.status(400).json({ error: "Invalid room_group_id" });
      }

      // insert room
      const query = "INSERT INTO rooms (room_group_id, room_name, floor_number, description) VALUES (?, ?, ?, ?)";
      db.query(query, [room_group_id, room_name, floor_number, description], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Room created", id: result.insertId });
      });
    });
  });

  // ✅ PUT update room
  router.put("/:id", (req, res) => {
    const { room_group_id, room_name, floor_number, description } = req.body;

    const query = `
      UPDATE rooms 
      SET room_group_id = ?, room_name = ?, floor_number = ?, description = ?
      WHERE room_id = ?
    `;
    db.query(query, [room_group_id, room_name, floor_number, description, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Room not found" });
      res.json({ message: "Room updated" });
    });
 
  });

  // ✅ DELETE room
  router.delete("/:id", (req, res) => {
    const query = "DELETE FROM rooms WHERE room_id = ?";
    db.query(query, [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Room not found" });
      res.json({ message: "Room deleted" });
    });
  });

  return router;
};

