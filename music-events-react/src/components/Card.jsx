// src/components/Card.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

// Simple portal-based modal
const Modal = ({ onClose, children }) => {
  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="event-card"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 480, maxWidth: "92%" }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

const Card = ({
  id,
  title,
  date,
  time,
  location,
  performer,
  price,
  type,
  isManager = false,
  token = null,
  onUpdated,
  onDeleted,
}) => {
  const navigate = useNavigate();

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    date: date || "",
    time: time || "",
    location: location || "",
    performer: performer || "",
    type: type || "concert",
  });

  const types = ["concert", "festival", "opera", "benefit concert"];
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Manager: update
  const saveEdit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMsg("Missing token.");
      return;
    }
    try {
      setSaving(true);
      setMsg("");
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: form.date,
          time: form.time,
          location: form.location,
          performer: form.performer,
          type: form.type, // validated in controller
        }),
      });
      if (!res.ok) {
        let m = "Update failed.";
        try {
          const j = await res.json();
          m = j.message || JSON.stringify(j);
        } catch {}
        throw new Error(m);
      }
      const j = await res.json();
      const updated = j?.event?.data || j?.event || j?.data || { id, ...form, title, price };
      onUpdated && onUpdated(updated);
      setMsg(j.message || "Event updated.");
      setTimeout(() => setShowEdit(false), 800);
    } catch (e2) {
      setMsg(e2.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Manager: delete
  const del = async () => {
    if (!token) {
      alert("Missing token.");
      return;
    }
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        let m = "Delete failed.";
        try {
          const j = await res.json();
          m = j.message || JSON.stringify(j);
        } catch {}
        throw new Error(m);
      }
      onDeleted && onDeleted(id);
    } catch (e) {
      alert(e.message || "Something went wrong.");
    }
  };

  return (
    <div className="event-card">
      <h2>{title}</h2>
      <p>
        <strong>Date:</strong> {date}
      </p>
      <p>
        <strong>Time:</strong> {time}
      </p>
      <p>
        <strong>Location:</strong> {location}
      </p>
      <p>
        <strong>Performer:</strong> {performer}
      </p>
      <p>
        <strong>Price:</strong> ${price}
      </p>
      <p>
        <strong>Type:</strong> {type}
      </p>

      {!isManager ? (
        <button className="show-more-btn" onClick={() => navigate(`/events/${id}`)}>
          Show More
        </button>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button className="show-more-btn" onClick={() => setShowEdit(true)}>
            Edit
          </button>
          <button className="go-back-btn" onClick={del}>
            Delete
          </button>
        </div>
      )}

      {/* Edit modal via portal (manager only) */}
      {isManager && showEdit && (
        <Modal onClose={() => setShowEdit(false)}>
          <h3 style={{ marginTop: 0 }}>Edit Event</h3>

          {msg && (
            <div
              style={{
                background: msg.toLowerCase().includes("fail") ? "#ffecec" : "#ecffef",
                color: msg.toLowerCase().includes("fail") ? "#a40000" : "#0a7a2a",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              {msg}
            </div>
          )}

          <form onSubmit={saveEdit} style={{ marginRight: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
              <input
                name="date"
                type="date"
                value={form.date || ""}
                onChange={onChange}
                required
                style={inputStyle}
              />
              <input
                name="time"
                type="time"
                value={form.time || ""}
                onChange={onChange}
                required
                style={inputStyle}
              />
            </div>
            <input
              name="location"
              type="text"
              placeholder="Location"
              value={form.location || ""}
              onChange={onChange}
              required
              style={inputStyle}
            />
            <input
              name="performer"
              type="text"
              placeholder="Performer"
              value={form.performer || ""}
              onChange={onChange}
              required
              style={inputStyle}
            />
            <select
              name="type"
              value={form.type || "concert"}
              onChange={onChange}
              required
              style={inputStyle}
            >
              {["concert", "festival", "opera", "benefit concert"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="show-more-btn" type="submit" disabled={saving} style={{ flex: 1 }}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" className="go-back-btn" onClick={() => setShowEdit(false)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  marginBottom: 10,
};

export default Card;
