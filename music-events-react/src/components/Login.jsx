import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import "../App.css";

const API_BASE = "http://127.0.0.1:8000/api";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        let msg = "Login failed.";
        try {
          const data = await res.json();
          msg = data.message || JSON.stringify(data);
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      // Expecting { user: {...}, token: "..." }
      if (data?.user) sessionStorage.setItem("user", JSON.stringify(data.user));
      if (data?.token) sessionStorage.setItem("token", data.token);

      navigate("/home"); // go home
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="events-container" style={{ gap: 20 }}>
      <Logo />
      <div className="event-card" style={{ width: 450, maxWidth: "150%" }}>
        <h2 style={{ marginTop: 0, marginBottom: 10, textTransform: "uppercase" }}>Welcome back</h2>
        <p style={{ marginTop: 0, color: "#555" }}>Log in to continue.</p>

        {error && (
          <div style={{ background: "#ffecec", color: "#a40000", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ marginRight: "20px"}}> 
          <label htmlFor="email" style={{ display: "block", textAlign: "left", marginBottom: 6, fontWeight: "bold" }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            required
            autoFocus
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
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 16 }}
          />

          <button className="show-more-btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 14, color: "#333" }}>
          New here?{" "}
          <Link to="/register" style={{ fontWeight: "bold", color: "black", textDecoration: "underline" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
