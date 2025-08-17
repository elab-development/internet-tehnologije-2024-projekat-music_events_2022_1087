import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import "../App.css";
import { Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = useMemo(() => sessionStorage.getItem("token"), []);
  const user = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);
  const isManager = !!(user && (user.is_manager === 1 || user.is_manager === "1" || user.is_manager === true));

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    performer: "",
    price: "",
    type: "concert",
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/events`, { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
        else setError("Invalid data received.");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setError("Failed to load events.");
        setLoading(false);
      });
  }, []);

  const filteredEvents = events
    .filter((event) => event.title.toLowerCase().includes(search.toLowerCase()))
    .filter((event) => (typeFilter ? event.type === typeFilter : true))
    .sort((a, b) => (sortBy === "asc" ? a.price - b.price : b.price - a.price));

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
  const displayedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const onDeleted = (id) => setEvents((prev) => prev.filter((e) => e.id !== id));
  const onUpdated = (ev) => setEvents((prev) => prev.map((e) => (e.id === ev.id ? { ...e, ...ev } : e)));

  const openCreate = () => {
    if (!isManager) return;
    setCreateForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      performer: "",
      price: "",
      type: "concert",
    });
    setCreateErr("");
    setShowCreate(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!isManager || !token) {
      setCreateErr("Only managers can create events.");
      return;
    }
    try {
      setCreating(true);
      setCreateErr("");
      const res = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description,
          date: createForm.date,
          time: createForm.time,
          location: createForm.location,
          performer: createForm.performer,
          price: Number(createForm.price),
          type: createForm.type,
        }),
      });
      if (!res.ok) {
        let msg = "Create failed.";
        try { const d = await res.json(); msg = d.message || JSON.stringify(d); } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      const newEvent = data?.data || data; // EventResource or raw event
      setEvents((prev) => [...prev, newEvent]);
      setShowCreate(false);
    } catch (err) {
      setCreateErr(err.message || "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  const types = ["concert", "festival", "opera", "benefit concert"];

  return (
    <div className="events-container">
      <h1 className="main-title">EVENTS</h1>

      <div style={{ marginBottom: "20px" }}>
        <Link style={{ color: "white" }} to="/home">Home</Link> &gt; <span>Events</span>
      </div>

      <div className="controls" style={{ flexWrap: "wrap", gap: 10 }}>
        <input type="text" placeholder="Search events..." onChange={(e) => setSearch(e.target.value)} />
        <select onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <button onClick={() => setSortBy(sortBy === "asc" ? "desc" : "asc")}>
          Sort by Price ({sortBy === "asc" ? "Low to High" : "High to Low"})
        </button>

        {isManager && (
          <button className="show-more-btn" style={{ marginLeft: "auto" }} onClick={openCreate}>
            + Create Event
          </button>
        )}
      </div>

      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="events-list">
        {displayedEvents.map((event) => (
          <Card
            key={event.id}
            {...event}
            isManager={isManager}
            token={token}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
        ))}
      </div>

      <div className="pagination-container">
        <div className="pagination-box">
          <button className="pagination-btn" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
            Prev
          </button>
          <span style={{ color: "black", fontWeight: "bold" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Event Modal (manager only) */}
      {isManager && showCreate && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreate(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="event-card" onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: "92%" }}>
            <h3 style={{ marginTop: 0 }}>Create Event</h3>

            {createErr && (
              <div style={{ background: "#ffecec", color: "#a40000", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
                {createErr}
              </div>
            )}

            <form onSubmit={submitCreate} style={{ marginRight: "20px" }}>
              <input
                type="text"
                placeholder="Title"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                required
                style={inputStyle}
              />
              <textarea
                placeholder="Description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
                required
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  type="date"
                  value={createForm.date}
                  onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  type="time"
                  value={createForm.time}
                  onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <input
                type="text"
                placeholder="Location"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Performer"
                value={createForm.performer}
                onChange={(e) => setCreateForm({ ...createForm, performer: e.target.value })}
                required
                style={inputStyle}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  type="number"
                  min={0}
                  placeholder="Price"
                  value={createForm.price}
                  onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                  required
                  style={inputStyle}
                />
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  required
                  style={inputStyle}
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button className="show-more-btn" type="submit" disabled={creating} style={{ flex: 1 }}>
                  {creating ? "Creating..." : "Create"}
                </button>
                <button className="go-back-btn" type="button" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: "90%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  marginBottom: 10,
};

export default Events;
