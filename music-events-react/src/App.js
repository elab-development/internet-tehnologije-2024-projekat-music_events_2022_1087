import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Logo from "./components/Logo";
import "./App.css";

const App = () => {
    return (
        <Router>
            <div className="app-container">
            <Navigation />
            <Logo />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<h1>Events Page</h1>} />
                    <Route path="/plans" element={<h1>Subscription Plans</h1>} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;

