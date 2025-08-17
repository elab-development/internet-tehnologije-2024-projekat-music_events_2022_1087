// src/components/Analytics.jsx  (or src/pages/Analytics.jsx)
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import "../App.css";

const API_BASE = "http://127.0.0.1:8000/api";

const Analytics = () => {
  const navigate = useNavigate();

  const token = useMemo(() => sessionStorage.getItem("token"), []);
  const me = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null"); } catch { return null; }
  }, []);
  const isManager = !!me?.is_manager;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [summary, setSummary] = useState(null);
  const [perEvent, setPerEvent] = useState([]);
  const [last30, setLast30] = useState([]);

  useEffect(() => {
    if (!isManager) {
      navigate("/home");
      return;
    }
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/bookings/stats`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          let msg = "Failed to load stats.";
          try { const j = await res.json(); msg = j.message || JSON.stringify(j); } catch {}
          throw new Error(msg);
        }
        const j = await res.json();
        setSummary(j.summary || {});
        setPerEvent(Array.isArray(j.per_event) ? j.per_event : []);
        setLast30(Array.isArray(j.last_30_days) ? j.last_30_days : []);
      } catch (e) {
        setErr(e.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isManager, navigate, token]);

  if (!isManager) return null;

  return (
    <div className="analytics-wrap">
      {/* WHITE SURFACE */}
      <div className="analytics-surface">
        <div className="analytics-breadcrumb" style={{ color: "black" }}>
          <Link style={{ color: "black" }} to="/home">Home</Link> &gt; <span>Analytics</span>
        </div>

        <h1 className="main-title analytics-title">ANALYTICS</h1>

        {err && <div className="analytics-alert">{err}</div>}

        {loading ? (
          <p className="loading-text">Loading…</p>
        ) : (
          <>
            {/* KPIs */}
            <section className="kpi-grid">
              <Kpi label="Total bookings" value={summary?.total_bookings ?? 0} />
              <Kpi label="Tickets sold" value={summary?.tickets_sold ?? 0} />
              <Kpi label="Total revenue" value={`$${summary?.total_revenue ?? 0}`} />
              <Kpi label="Avg tickets / booking" value={summary?.avg_tickets_per_booking ?? 0} />
            </section>

            {/* Charts */}
            <section className="charts-grid">
              <div className="chart-card chart--half">
                <h3 className="chart-title">Revenue by event</h3>
                <div className="chart-box chart-h-460">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perEvent} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid stroke="#e5e5e5" />
                      <XAxis
                        dataKey="event_title"
                        stroke="#000"
                        tick={{ fill: "#000", fontSize: 11 }}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis stroke="#000" tick={{ fill: "#000", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #000", borderRadius: 8, color: "#000" }} />
                      <Legend wrapperStyle={{ color: "#000" }} />
                      <Bar dataKey="revenue" name="Revenue" fill="#000" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card chart--half">
                <h3 className="chart-title">Tickets by event</h3>
                <div className="chart-box chart-h-460">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perEvent} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid stroke="#e5e5e5" />
                      <XAxis
                        dataKey="event_title"
                        stroke="#000"
                        tick={{ fill: "#000", fontSize: 11 }}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis stroke="#000" tick={{ fill: "#000", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #000", borderRadius: 8, color: "#000" }} />
                      <Legend wrapperStyle={{ color: "#000" }} />
                      <Bar dataKey="tickets" name="Tickets" fill="#444" />
                      <Bar dataKey="bookings" name="Bookings" fill="#999" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const Kpi = ({ label, value }) => (
  <div className="kpi-card">
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}</div>
  </div>
);

export default Analytics;
