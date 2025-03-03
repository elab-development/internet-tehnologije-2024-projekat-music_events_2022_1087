// src/components/Logo.jsx
import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "../App.css"; // Reuse global styles

const Logo = () => {
    return (
        <Link to="/" className="logo-container">
            <img src="/assets/logo.png" alt="Echo Logo" className="logo-image" />
        </Link>
    );
};

export default Logo;
