// export default RoomPage;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TEMP_THRESHOLD = 35;     // match your backend thresholds
const HUMIDITY_THRESHOLD = 50;

const RoomPage = () => {
  const { id } = useParams(); // room id
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoomSensors() {
      try {
        // 1) Get sensors for this room
        const sensorsRes = await axios.get(`http://localhost:5000/rooms/${id}/sensors`);
        const sensorsList = sensorsRes.data;

        // 2) Fetch latest reading for each sensor
        const promises = sensorsList.map((s) =>
          axios
            .get(`http://localhost:5000/sensor-readings/latest/${s.sensor_id}`)
            .then((r) => ({ ...s, latest: r.data }))
            .catch(() => ({ ...s, latest: null }))
        );

        const withReadings = await Promise.all(promises);
        setSensors(withReadings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoomSensors();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="room-page">
      <h1>Room {id} — Sensors</h1>
      {sensors.length === 0 && <p>No sensors found for this room.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sensors.map((s) => {
          const isAlert =
            (s.latest?.temperature ?? 0) > TEMP_THRESHOLD ||
            (s.latest?.humidity ?? 0) > HUMIDITY_THRESHOLD;

          return (
            <li
              key={`${id}-${s.sensor_id}`}  // safer unique key
              style={{
                border: `2px solid ${isAlert ? "red" : "#ccc"}`,
                margin: "10px 0",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: isAlert ? "#fff0f0" : "#f9f9f9",
                transition: "background-color 0.3s, border-color 0.3s",
              }}
            >
              <strong style={{ fontSize: "1.1rem" }}>{s.sensor_name || s.name}</strong>
              <div>Temperature: {s.latest?.temperature ?? "—"} °C</div>
              <div>Humidity: {s.latest?.humidity ?? "—"} %</div>
              <small>
                Last: {s.latest ? new Date(s.latest.timestamp).toLocaleString() : "N/A"}
              </small>
              {isAlert && (
                <div style={{ color: "red", fontWeight: "bold", marginTop: "5px" }}>
                  ⚠️ Alert!
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RoomPage;
