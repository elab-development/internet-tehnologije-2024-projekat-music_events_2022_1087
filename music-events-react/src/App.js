import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Logo from "./components/Logo";
import Events from "./components/Events";
import EventInfo from "./components/EventInfo";
import Footer from "./components/Footer";
import SubscriptionPlan from "./components/SubscriptionPlan";
import AdPopup from "./components/AdPopup";
import Login from "./components/Login";
import Register from "./components/Register";
import Reservations from "./components/Reservations";
import Analytics from "./components/Analytics";
import "./App.css";

const App = () => {
  const [hasUser, setHasUser] = useState(!!sessionStorage.getItem("user"));

  useEffect(() => {
    const checkSession = () => {
      try {
        const raw = sessionStorage.getItem("user");
        setHasUser(!!raw);
      } catch {
        setHasUser(false);
      }
    };

    checkSession(); // initial check immediately on mount
    const id = setInterval(checkSession, 1000); // poll every second
    return () => clearInterval(id); // cleanup on unmount
  }, []);

  return (
    <Router>
      <div className="app-container">
        <AdPopup />
        {hasUser && <Navigation />}
        <Logo />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventInfo />} />
          <Route path="/plans" element={<SubscriptionPlan />} />
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
        {hasUser && <Footer />}
      </div>
    </Router>
  );
};

export default App;
