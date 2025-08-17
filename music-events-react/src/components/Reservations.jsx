// src/components/Reservations.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const API_BASE = "http://127.0.0.1:8000/api";

const Reservations = () => {
  const navigate = useNavigate();

  const token = useMemo(() => sessionStorage.getItem("token"), []);
  const me = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editTickets, setEditTickets] = useState(1);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // Review modal state
  const [showReview, setShowReview] = useState(false);
  const [reviewRow, setReviewRow] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewErr, setReviewErr] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/"); // force login
      return;
    }
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        // Backend index() returns ONLY the logged-in user's bookings (paginated).
        const res = await fetch(`${API_BASE}/bookings`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          navigate("/");
          return;
        }
        if (!res.ok) {
          let msg = "Failed to load your bookings.";
          try {
            const j = await res.json();
            msg = j.message || JSON.stringify(j);
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();

        // Normalize possible shapes
        let list =
          data?.bookings?.data ||
          data?.bookings ||
          data?.data ||
          [];

        if (!Array.isArray(list)) list = [];

        // Ensure each row includes event details; keep any review info if present
        const completed = await Promise.all(
          list.map(async (b) => {
            if (!b?.event && b?.event_id) {
              try {
                const er = await fetch(`${API_BASE}/events/${b.event_id}`);
                const ej = await er.json();
                b = { ...b, event: ej?.data || ej };
              } catch {}
            }
            return b;
          })
        );

        setRows(completed);
      } catch (e) {
        setErr(e.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, navigate]);

  const openEdit = (row) => {
    setEditRow(row);
    setEditTickets(row?.number_of_tickets || 1);
    setActionMsg("");
    setShowEdit(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editRow) return;
    try {
      setSaving(true);
      setActionMsg("");
      const res = await fetch(`${API_BASE}/bookings/${editRow.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ number_of_tickets: Number(editTickets) }),
      });
      if (!res.ok) {
        let msg = "Update failed.";
        try {
          const j = await res.json();
          msg = j.message || JSON.stringify(j);
        } catch {}
        throw new Error(msg);
      }
      const j = await res.json();

      // Update UI
      setRows((old) =>
        old.map((r) =>
          r.id === editRow.id
            ? {
                ...r,
                number_of_tickets: Number(editTickets),
                total_price:
                  (r?.event?.price ? Number(r.event.price) : 0) *
                    Number(editTickets) || j?.booking?.total_price || r.total_price,
              }
            : r
        )
      );
      setActionMsg(j.message || "Booking updated successfully!");
      setTimeout(() => setShowEdit(false), 800);
    } catch (e) {
      setActionMsg(e.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${row.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        let msg = "Delete failed.";
        try {
          const j = await res.json();
          msg = j.message || JSON.stringify(j);
        } catch {}
        throw new Error(msg);
      }
      setRows((old) => old.filter((r) => r.id !== row.id));
    } catch (e) {
      alert(e.message || "Something went wrong.");
    }
  };

  // ---------- Reviews ----------
  const hasReview = (row) => {
    // Try common shapes from BookingResource or our local flag
    if (row?.has_review) return true;
    if (row?.review && row.review !== null) return true;
    if (typeof row?.review_id !== "undefined" && row.review_id !== null) return true;
    return false;
    // Backend will still enforce "one review per booking"
  };

  const openReview = (row) => {
    if (me?.is_manager) return; // managers can't leave reviews
    setReviewRow(row);
    setReviewRating(5);
    setReviewComment("");
    setReviewMsg("");
    setReviewErr("");
    setShowReview(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewRow) return;
    try {
      setReviewSaving(true);
      setReviewMsg("");
      setReviewErr("");

      const res = await fetch(`${API_BASE}/bookings/${reviewRow.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(reviewRating),
          comment: reviewComment,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to create review.";
        try {
          const j = await res.json();
          msg = j.message || JSON.stringify(j);
        } catch {}
        throw new Error(msg);
      }

      const j = await res.json();
      setReviewMsg(j.message || "Review created successfully!");

      // Mark this row as reviewed locally so the button disables
      setRows((old) =>
        old.map((r) =>
          r.id === reviewRow.id
            ? { ...r, has_review: true, review: j?.review || r.review, review_id: j?.review?.id ?? r.review_id }
            : r
        )
      );

      setTimeout(() => setShowReview(false), 1000);
    } catch (e) {
      setReviewErr(e.message || "Something went wrong.");
    } finally {
      setReviewSaving(false);
    }
  };

  if (!token || !me) {
    return <p className="loading-text">Please log in.</p>;
  }

  return (
    <div
      className="event-info-container"
      style={{ maxWidth: "1200px", width: "100%" }} // wider container so table fits
    >
      <div style={{ marginBottom: 20 }}>
        <Link style={{ color: "black" }} to="/home">Home</Link> &gt;{" "}
        <span>My Reservations</span>
      </div>

      <div
        className="event-card"
        style={{ padding: 0, width: "100%", maxWidth: "100%" }} // full-width card
      >
        <div style={{ padding: "16px 16px 0 16px" }}>
          <h2 style={{ margin: 0 }}>My Reservations</h2>
          <p style={{ marginTop: 6, color: "#555" }}>
            View, edit, cancel, or review your bookings.
          </p>
          {err && (
            <div style={{ background: "#ffecec", color: "#a40000", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
              {err}
            </div>
          )}
        </div>

        {loading ? (
          <p className="loading-text" style={{ padding: 16 }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p className="loading-text" style={{ padding: 16 }}>You have no reservations yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
              <thead>
                <tr style={{ background: "#f7f7f7", textAlign: "left" }}>
                  <th style={th}>Event</th>
                  <th style={th}>Date</th>
                  <th style={th}>Time</th>
                  <th style={th}>Location</th>
                  <th style={thRight}>Price</th>
                  <th style={thRight}>Tickets</th>
                  <th style={thRight}>Total</th>
                  <th style={thCenter}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const ev = r.event || {};
                  const total =
                    typeof r.total_price !== "undefined"
                      ? r.total_price
                      : ev.price
                      ? Number(ev.price) * Number(r.number_of_tickets)
                      : null;

                  const reviewed = hasReview(r);

                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                      <td style={td}>{ev.title || `#${r.event_id}`}</td>
                      <td style={td}>{ev.date || "-"}</td>
                      <td style={td}>{ev.time || "-"}</td>
                      <td style={td}>{ev.location || "-"}</td>
                      <td style={tdRight}>
                        {typeof ev.price !== "undefined" ? `$${ev.price}` : "-"}
                      </td>
                      <td style={tdRight}>{r.number_of_tickets}</td>
                      <td style={tdRight}>{total !== null ? `$${total}` : "-"}</td>
                      <td style={tdCenter}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            className="show-more-btn"
                            style={{ padding: "6px 10px" }}
                            onClick={() => openEdit(r)}
                          >
                            Edit
                          </button>
                          <button
                            className="go-back-btn"
                            style={{ padding: "6px 10px" }}
                            onClick={() => remove(r)}
                          >
                            Delete
                          </button>
                          {!me?.is_manager && (
                            reviewed ? (
                              <button
                                className="show-more-btn"
                                style={{ padding: "6px 10px", opacity: 0.6, cursor: "not-allowed" }}
                                disabled
                              >
                                Reviewed
                              </button>
                            ) : (
                              <button
                                className="show-more-btn"
                                style={{ padding: "6px 10px" }}
                                onClick={() => openReview(r)}
                              >
                                Review
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div
          className="modal-overlay"
          onClick={() => setShowEdit(false)}
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
            <h3 style={{ marginTop: 0 }}>Edit Booking</h3>

            {actionMsg && (
              <div
                style={{
                  background: actionMsg.toLowerCase().includes("fail") ? "#ffecec" : "#ecffef",
                  color: actionMsg.toLowerCase().includes("fail") ? "#a40000" : "#0a7a2a",
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                {actionMsg}
              </div>
            )}

            <form onSubmit={saveEdit} style={{ marginRight: "20px" }}>
              <div style={{ textAlign: "left", marginBottom: 12 }}>
                <label htmlFor="editTickets" style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}>
                  Number of tickets
                </label>
                <input
                  id="editTickets"
                  type="number"
                  min={1}
                  value={editTickets}
                  onChange={(e) => setEditTickets(e.target.value)}
                  required
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="show-more-btn" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" className="go-back-btn" onClick={() => setShowEdit(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review modal */}
      {showReview && (
        <div
          className="modal-overlay"
          onClick={() => setShowReview(false)}
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
            style={{ width: 480, maxWidth: "92%" }}
          >
            <h3 style={{ marginTop: 0 }}>Write a Review</h3>

            {reviewErr && (
              <div style={{ background: "#ffecec", color: "#a40000", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
                {reviewErr}
              </div>
            )}
            {reviewMsg && (
              <div style={{ background: "#ecffef", color: "black", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
                {reviewMsg}
              </div>
            )}

            <form onSubmit={submitReview} style={{ marginRight: "20px" }}>
              {/* Black star picker */}
              <div style={{ textAlign: "left", marginBottom: 12 }}>
                <div style={{ fontWeight: "bold", marginBottom: 6 }}>Your rating</div>
                <div>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const idx = i + 1;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReviewRating(idx)}
                        style={{
                          fontSize: 24,
                          color: "black",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 2,
                        }}
                        aria-label={`${idx} star${idx === 1 ? "" : "s"}`}
                      >
                        {idx <= reviewRating ? "★" : "☆"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ textAlign: "left", marginBottom: 16 }}>
                <label htmlFor="reviewComment" style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}>
                  Comment
                </label>
                <textarea
                  id="reviewComment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  rows={4}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", resize: "vertical" }}
                  placeholder="Share your experience…"
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="show-more-btn" type="submit" disabled={reviewSaving} style={{ flex: 1 }}>
                  {reviewSaving ? "Saving..." : "Submit"}
                </button>
                <button type="button" className="go-back-btn" onClick={() => setShowReview(false)} style={{ flex: 1 }}>
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

// Table cell styles (using your palette)
const th = { padding: "14px 18px", borderBottom: "1px solid #eee", whiteSpace: "nowrap" };
const thRight = { ...th, textAlign: "right" };
const thCenter = { ...th, textAlign: "center" };
const td = { padding: "14px 18px", verticalAlign: "top" };
const tdRight = { ...td, textAlign: "right" };
const tdCenter = { ...td, textAlign: "center" };

export default Reservations;
