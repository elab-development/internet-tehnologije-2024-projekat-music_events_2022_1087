import React from "react";
import { FaHome, FaMusic, FaRegCreditCard } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import "../App.css"; 

const Navigation = () => {
    return (
        <nav className="side-nav">
            <a href="/" data-tooltip-id="home-tooltip">
                <FaHome className="nav-icon" />
            </a>
            <Tooltip id="home-tooltip" place="right" content="Home" />

            <a href="/events" data-tooltip-id="events-tooltip">
                <FaMusic className="nav-icon" />
            </a>
            <Tooltip id="events-tooltip" place="right" content="Events" />

            <a href="/plans" data-tooltip-id="plans-tooltip">
                <FaRegCreditCard className="nav-icon" />
            </a>
            <Tooltip id="plans-tooltip" place="right" content="Subscription Plans" />
        </nav>
    );
};

export default Navigation;
