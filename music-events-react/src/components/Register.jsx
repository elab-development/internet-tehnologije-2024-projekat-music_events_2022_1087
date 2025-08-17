import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import "../App.css";

const API_BASE = "http://127.0.0.1:8000/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    is_manager: "0", // "0" = Regular user (default), "1" = Manager
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill out all fields.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.passwordConfirm,
          // Send as 0/1 for Laravel boolean casting:
          is_manager: form.is_manager === "1" ? 1 : 0,
        }),
      });

      if (!res.ok) {
        let msg = "Registration failed.";
        try {
          const data = await res.json();
          msg = data.message || JSON.stringify(data);
        } catch {}
        throw new Error(msg);
      }

      // Success → go to Login
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="events-container" style={{ gap: 20 }}>
      <Logo />
      <div className="event-card" style={{ width: 360, maxWidth: "90%" }}>
        <h2 style={{ marginTop: 0, marginBottom: 10, textTransform: "uppercase" }}>Create account</h2>
        <p style={{ marginTop: 0, color: "#555" }}>Join Echo and start booking.</p>

        {error && (
          <div style={{ background: "#ffecec", color: "#a40000", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ marginRight: "20px" }}>
          <label htmlFor="name" style={{ display: "block", textAlign: "left", marginBottom: 6, fontWeight: "bold" }}>Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={onChange}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
          />

          <label htmlFor="email" style={{ display: "block", textAlign: "left", marginBottom: 6, fontWeight: "bold" }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
          />

          <label htmlFor="password" style={{ display: "block", textAlign: "left", marginBottom: 6, fontWeight: "bold" }}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={onChange}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
          />

          <label htmlFor="passwordConfirm" style={{ display: "block", textAlign: "left", marginBottom: 6, fontWeight: "bold" }}>
            Confirm Password
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            placeholder="••••••••"
            value={form.passwordConfirm}
            onChange={onChange}
            required
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
          />

          {/* Account Type (Manager vs User) */}
          <label htmlFor="is_manager" style={{ display: "block", textAlign: "left", marginBottom: 6, fontWeight: "bold" }}>
            Account Type
          </label>
          <select
            id="is_manager"
            name="is_manager"
            value={form.is_manager}
            onChange={onChange}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 16, background: "white" }}
          >
            <option value="0">Regular user</option>
            <option value="1">Manager</option>
          </select>

          <button className="show-more-btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 14, color: "#333" }}>
          Already have an account?{" "}
          <Link to="/" style={{ fontWeight: "bold", color: "black", textDecoration: "underline" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
