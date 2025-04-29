import React from "react";
import { FaEnvelope, FaTrademark } from "react-icons/fa";
import "../App.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <img src="/assets/logo.png" alt="Echo Logo" className="footer-logo-img" />
                    <h2 className="footer-title">Echo <FaTrademark className="trademark-icon" /></h2>
                </div>

                <div className="footer-links">
                    <p>
                        <FaEnvelope className="footer-icon" /> Business Inquiries:{" "}
                        <a href="mailto:business@echo.com">business@echo.com</a>
                    </p>
                    <p>
                        <FaEnvelope className="footer-icon" /> Support:{" "}
                        <a href="mailto:support@echo.com">support@echo.com</a>
                    </p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Echo™. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
