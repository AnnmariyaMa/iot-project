import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/dashboard.css";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // fetch alerts from backend
    axios.get("http://localhost:5000/alerts")
      .then(res => setAlerts(res.data))
      .catch(err => console.error("Failed to load alerts", err));
  }, []);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="logo">IoT Panel</h2>
        <nav>
  <ul>
    <li className="active">
      <Link to="/">Dashboard</Link>
    </li>
    <li>
      <Link to="/rooms">Rooms</Link>
    </li>
    <li>
      <Link to="/sensors">Sensors</Link>
    </li>
    <li>
      <Link to="/alerts">Alerts</Link>
    </li>
    <li>
      <Link to="/devices">Devices</Link>
    </li>
    <li>
      <Link to="/settings">Settings</Link>
    </li>
  </ul>
</nav>

      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Dashboard Overview</h1>
          <div className="profile">
            <span>🔔</span>
          </div>
        </header>

        <section className="alerts">
          <h2>Active Alerts</h2>
          {alerts.length === 0 ? (
            <p>No alerts</p>
          ) : (
            <ul>
              {alerts.map(a => (
                <li key={a.id}>
                  <strong>{a.alert_type}</strong> — {a.message} 
                  <div className="meta">Sensor {a.sensor_id} • {new Date(a.timestamp).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
