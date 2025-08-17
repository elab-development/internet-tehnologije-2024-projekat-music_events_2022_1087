// src/components/Navigation.jsx
import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaMusic, FaRegCreditCard, FaChartBar } from "react-icons/fa";
import { GrTicket } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import "../App.css";

const API_BASE = "http://127.0.0.1:8000/api";

const Navigation = () => {
  const navigate = useNavigate();

  const token = useMemo(() => sessionStorage.getItem("token"), []);
  const user = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);
  const isManager = !!user?.is_manager;

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (_) {
      // ignore — we still clear client state
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      navigate("/"); // back to login
    }
  };

  return (
    <nav className="side-nav">
      {/* Home */}
      <NavLink to="/home" data-tooltip-id="home-tooltip">
        <FaHome className="nav-icon" />
      </NavLink>
      <Tooltip id="home-tooltip" place="right" content="Home" />

      {/* Events */}
      <NavLink to="/events" data-tooltip-id="events-tooltip">
        <FaMusic className="nav-icon" />
      </NavLink>
      <Tooltip id="events-tooltip" place="right" content="Events" />

      {/* Manager-only: Analytics */}
      {isManager ? (
        <>
          <NavLink to="/analytics" data-tooltip-id="analytics-tooltip">
            <FaChartBar className="nav-icon" />
          </NavLink>
          <Tooltip id="analytics-tooltip" place="right" content="Analytics" />
        </>
      ) : (
        <>
          {/* Regular user: Plans + Bookings */}
          <NavLink to="/plans" data-tooltip-id="plans-tooltip">
            <FaRegCreditCard className="nav-icon" />
          </NavLink>
          <Tooltip id="plans-tooltip" place="right" content="Subscription Plans" />

          <NavLink to="/reservations" data-tooltip-id="bookings-tooltip">
            <GrTicket className="nav-icon" />
          </NavLink>
          <Tooltip id="bookings-tooltip" place="right" content="Bookings" />
        </>
      )}

      {/* Logout (always visible) */}
      <button
        type="button"
        onClick={logout}
        className="nav-icon-btn"
        data-tooltip-id="logout-tooltip"
        aria-label="Log out"
        style={{ marginTop: "auto" }} // push to bottom of the rail
      >
        <FiLogOut className="nav-icon" />
      </button>
      <Tooltip id="logout-tooltip" place="right" content="Log out" />
    </nav>
  );
};

export default Navigation;
