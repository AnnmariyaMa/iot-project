import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const RoomPage = () => {
  const { id } = useParams(); // room id
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoomSensors() {
      try {
        // 1) get sensors for room (adjust endpoint to your backend)
        const sensorsRes = await axios.get(`http://localhost:5000/rooms/${id}/sensors`);
        const sensorsList = sensorsRes.data; // expect array of sensors with sensor_id and name
        // 2) fetch latest reading for each sensor in parallel
        const promises = sensorsList.map(s =>
          axios.get(`http://localhost:5000/sensor-readings/latest/${s.sensor_id}`)
            .then(r => ({ ...s, latest: r.data }))
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
      <ul>
        {sensors.map(s => (
          <li key={s.sensor_id}>
            <strong>{s.sensor_name || s.name}</strong>
            <div>
              Temperature: {s.latest?.temperature ?? "—"} °C
            </div>
            <div>
              Humidity: {s.latest?.humidity ?? "—"} %
            </div>
            <small>Last: {s.latest ? new Date(s.latest.timestamp).toLocaleString() : "N/A"}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomPage;
