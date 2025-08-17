// src/components/EventInfo.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useImages from "../hooks/useImages";
import MapComponent from "../components/MapComponent";
import "../App.css";

const API_BASE = "http://127.0.0.1:8000/api";

// Simple black-star renderer
const Stars = ({ value = 0, size = 22, label = "" }) => {
  const filled = Math.round(Number(value) || 0);
  return (
    <span aria-label={label || `${filled} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: size, color: "black", marginRight: 2 }}>
          {i < filled ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
};

const EventInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const { images, loading: imageLoading, error: imageError } = useImages(event?.title, 1);

  // Booking modal state
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  const token = useMemo(() => sessionStorage.getItem("token"), []);
  const authHeaders = token
    ? { Accept: "application/json", Authorization: `Bearer ${token}` }
    : { Accept: "application/json" };

  // Fetch event (send token if present)
  useEffect(() => {
    fetch(`${API_BASE}/events/${id}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setEvent(data.data))
      .catch((err) => console.error("Error fetching event:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  // Fetch reviews for this event (send token if present)
  const loadReviews = () => {
    setReviewsLoading(true);
    setReviewsError("");
    fetch(`${API_BASE}/events/${id}/reviews`, { headers: authHeaders })
      .then(async (res) => {
        if (!res.ok) {
          let msg = "Failed to load reviews.";
          try { const j = await res.json(); msg = j.message || JSON.stringify(j); } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data) => {
        setAvgRating(data?.average_rating || 0);
        const list = data?.reviews?.data ?? data?.reviews ?? [];
        setReviews(Array.isArray(list) ? list : []);
      })
      .catch((e) => setReviewsError(e.message || "Something went wrong."))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  // BOOKING
  const openBooking = () => {
    if (!token) { navigate("/"); return; }
    setTickets(1);
    setSaveError(""); setSaveMsg("");
    setShowModal(true);
  };

  const handleSaveBooking = async (e) => {
    e.preventDefault();
    setSaveError(""); setSaveMsg("");
    if (!token) { navigate("/"); return; }
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: Number(id),
          number_of_tickets: Number(tickets),
        }),
      });

      if (!res.ok) {
        let msg = "Failed to create booking.";
        try { const data = await res.json(); msg = data.message || JSON.stringify(data); } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      setSaveMsg(data.message || "Booking created successfully!");
      setTimeout(() => setShowModal(false), 1000);
    } catch (err) {
      setSaveError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (!event) return <p className="loading-text">Loading event...</p>;

  const total = Number(tickets || 0) * Number(event.price || 0);

  return (
    <div className="event-info-container">
      <div style={{ marginBottom: "20px" }}>
        <Link style={{ color: "black" }} to="/home">Home</Link> &gt;{" "}
        <Link style={{ color: "black" }} to="/events">Events</Link> &gt; <span>Event Info</span>
      </div>

      {imageLoading ? (
        <p className="loading-text">Loading image...</p>
      ) : imageError || !images.length ? (
        <p className="loading-text">No image available.</p>
      ) : (
        <img className="event-image" src={images[0].urls.regular} alt={event.title} />
      )}

      <h1 className="event-title">{event.title}</h1>
      <p className="event-description">{event.description}</p>

      <div className="event-details">
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Performer:</strong> {event.performer}</p>
        <p><strong>Price:</strong> ${event.price}</p>
        <p><strong>Type:</strong> {event.type}</p>
      </div>

      <MapComponent
        locationName={event.location}
        eventTitle={event.title}
        performer={event.performer}
        price={event.price}
      />

      <div className="button-group" style={{ gap: 12 }}>
        <button className="book-now-btn" onClick={openBooking}>
          Book Now
        </button>
        {/* Removed "Write Review" button as requested */}
        <button className="go-back-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>

      {/* Reviews — centered */}
      <div
        className="event-card"
        style={{
          width:"650px",
          margin: "24px auto 0",
          maxWidth: "1000px",         // nicely centered width
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 6, textAlign: "center" }}>Reviews</h3>
        {reviewsLoading ? (
          <p className="loading-text" style={{ textAlign: "center" }}>Loading reviews…</p>
        ) : reviewsError ? (
          <div style={{ background: "#ffecec", color: "#a40000", padding: "10px 12px", borderRadius: 8, textAlign: "center" }}>
            {reviewsError}
          </div>
        ) : (
          <>
            {/* Average */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
                justifyContent: "center",   // center the stars/avg row
                textAlign: "center",
              }}
            >
              <Stars value={avgRating} size={24} label={`Average rating ${avgRating}`} />
              <div style={{ fontWeight: "bold", fontSize: 18, color: "black" }}>{avgRating || 0}</div>
              <div style={{ color: "#555" }}>({reviews.length} review{reviews.length === 1 ? "" : "s"})</div>
            </div>

            {/* List */}
            {reviews.length === 0 ? (
              <p className="loading-text" style={{ margin: 0, textAlign: "center" }}>No reviews yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {reviews.map((r) => {
                  const rating = r?.rating ?? r?.data?.rating ?? 0;
                  const comment = r?.comment ?? r?.data?.comment ?? "";
                  const userName = r?.user?.name || (typeof r?.user_id !== "undefined" ? `User #${r.user_id}` : "User");
                  const created = r?.created_at ? new Date(r.created_at).toLocaleDateString() : "";

                  return (
                    <div
                      key={r.id || `${userName}-${created}-${Math.random()}`}
                      className="event-card"
                      style={{ padding: 16 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontWeight: "bold", color: "black" }}>{userName}</div>
                        <div style={{ color: "#555" }}>{created}</div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Stars value={rating} size={18} label={`Rating ${rating}`} />
                      </div>
                      <div style={{ color: "black", lineHeight: 1.5 }}>{comment}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
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
          <div
            className="event-card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 420, maxWidth: "92%" }}
          >
            <h3 style={{ marginTop: 0 }}>Book Tickets</h3>

            {saveError && (
              <div style={{ background: "#ffecec", color: "#a40000", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
                {saveError}
              </div>
            )}
            {saveMsg && (
              <div style={{ background: "#ecffef", color: "#0a7a2a", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
                {saveMsg}
              </div>
            )}

            <form onSubmit={handleSaveBooking} style={{ marginRight: "20px" }}>
              <div style={{ textAlign: "left", marginBottom: 12 }}>
                <label htmlFor="tickets" style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}>
                  Number of tickets
                </label>
                <input
                  id="tickets"
                  type="number"
                  min={1}
                  value={tickets}
                  onChange={(e) => setTickets(e.target.value)}
                  required
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ textAlign: "left", marginBottom: 16 }}>
                <strong>Total:</strong> ${isNaN(Number(tickets) * Number(event.price || 0)) ? 0 : Number(tickets) * Number(event.price || 0)}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="show-more-btn" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="go-back-btn"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
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

export default EventInfo;
