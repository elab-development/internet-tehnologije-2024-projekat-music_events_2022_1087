import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import "../App.css";

const Events = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [sortBy, setSortBy] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch("http://127.0.0.1:8000/api/events")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setEvents(data);
                } else {
                    setError("Invalid data received.");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching events:", err);
                setError("Failed to load events.");
                setLoading(false);
            });
    }, []);

    const filteredEvents = events
        .filter((event) => event.title.toLowerCase().includes(search.toLowerCase()))
        .filter((event) => (typeFilter ? event.type === typeFilter : true))
        .sort((a, b) => (sortBy === "asc" ? a.price - b.price : b.price - a.price));

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const displayedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="events-container">
            <h1 className="main-title">EVENTS</h1>

            <div className="controls">
                <input type="text" placeholder="Search events..." onChange={(e) => setSearch(e.target.value)} />
                <select onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="concert">Concert</option>
                    <option value="festival">Festival</option>
                    <option value="opera">Opera</option>
                    <option value="benefit concert">Benefit Concert</option>
                </select>
                <button onClick={() => setSortBy(sortBy === "asc" ? "desc" : "asc")}>
                    Sort by Price ({sortBy === "asc" ? "Low to High" : "High to Low"})
                </button>
            </div>

            {loading && <p>Loading events...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="events-list">
                {displayedEvents.map((event) => (
                    <Card key={event.id} {...event} />
                ))}
            </div>

            <div className="pagination-container">
                <div className="pagination-box">
                    <button className="pagination-btn" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                        Prev
                    </button>
                    <span style={{color:"black", fontWeight:"bold"}}>Page {currentPage} of {totalPages}</span>
                    <button className="pagination-btn" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Events;
