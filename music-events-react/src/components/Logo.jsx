import React from "react";
import { Link } from "react-router-dom"; 
import "../App.css"; 

const Logo = () => {
    return (
        <Link to="/" className="logo-container">
            <img src="/assets/logo.png" alt="Echo Logo" className="logo-image" />
        </Link>
    );
};

export default Logo;
