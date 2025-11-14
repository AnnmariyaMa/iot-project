const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // ✅ GET all room groups
  router.get("/", (req, res) => {
    const query = "SELECT * FROM room_groups";
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // ✅ GET one room group by ID
  router.get("/:id", (req, res) => {
    const query = "SELECT * FROM room_groups WHERE room_group_id = ?";
    db.query(query, [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ message: "Not found" });
      res.json(results[0]);
    });
  });

  // ✅ POST new room group
  router.post("/", (req, res) => {
    const { group_name, description } = req.body;
    if (!group_name || !description) {
      return res.status(400).json({ error: "group_name and description are required" });
    }
    const query = "INSERT INTO room_groups (group_name, description) VALUES (?, ?)";
    db.query(query, [group_name, description], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Room group created", id: result.insertId });
    });
  });

  // ✅ PUT update room group
  router.put("/:id", (req, res) => {
    const { group_name, description } = req.body;
    const query = "UPDATE room_groups SET group_name = ?, description = ? WHERE room_group_id = ?";
    db.query(query, [group_name, description, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Room group updated" });
    });
  });

  // ✅ DELETE room group
  router.delete("/:id", (req, res) => {
    const query = "DELETE FROM room_groups WHERE room_group_id = ?";
    db.query(query, [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Room group deleted" });
    });
  });

  return router;
};

