// src/components/Card.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Card = ({ id, title, date, time, location, performer, price, type }) => {
    const navigate = useNavigate();

    return (
        <div className="event-card">
            <h2>{title}</h2>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Time:</strong> {time}</p>
            <p><strong>Location:</strong> {location}</p>
            <p><strong>Performer:</strong> {performer}</p>
            <p><strong>Price:</strong> ${price}</p>
            <p><strong>Type:</strong> {type}</p>
            <button className="show-more-btn" onClick={() => navigate(`/events/${id}`)}>Show More</button>
        </div>
    );
};

export default Card;
