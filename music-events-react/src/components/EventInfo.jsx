import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useImages from "../hooks/useImages";
import MapComponent from "../components/MapComponent"; 
import "../App.css";

const EventInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const { images, loading: imageLoading, error: imageError } = useImages(event?.title, 1);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/events/${id}`)
            .then((res) => res.json())
            .then((data) => setEvent(data.data))
            .catch((err) => console.error("Error fetching event:", err));
    }, [id]);

    if (!event) return <p className="loading-text">Loading event...</p>;

    return (
        <div className="event-info-container">
            {imageLoading ? (
                <p className="loading-text">Loading image...</p>
            ) : imageError || !images.length ? (
                <p className="loading-text">No image available.</p>
            ) : (
                <img className="event-image" src={images[0].urls.regular} alt={event.title} />
            )}

            <h1 className="event-title">{event.title}</h1>
            <p className="event-description">{event.description}</p>

            <div className="event-details">
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Performer:</strong> {event.performer}</p>
                <p><strong>Price:</strong> ${event.price}</p>
                <p><strong>Type:</strong> {event.type}</p>
            </div>

            <MapComponent
                locationName={event.location}
                eventTitle={event.title}
                performer={event.performer}
                price={event.price}
            />

            <div className="button-group">
                <button className="book-now-btn" onClick={() => alert("Booking not implemented yet!")}>
                    Book Now
                </button>
                <button className="go-back-btn" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default EventInfo;
