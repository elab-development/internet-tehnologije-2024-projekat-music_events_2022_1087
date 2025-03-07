import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Logo from "./components/Logo";
import Events from "./components/Events";
import EventInfo from "./components/EventInfo";
import Footer from "./components/Footer";
import SubscriptionPlan from "./components/SubscriptionPlan";
import AdPopup from "./components/AdPopup";
import "./App.css";

const App = () => {
    return (
        <Router>
            <div className="app-container">
            <AdPopup />
            <Navigation />
            <Logo />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventInfo />} />
                    <Route path="/plans" element={<SubscriptionPlan />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;

