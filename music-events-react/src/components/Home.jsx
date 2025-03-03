// src/pages/Home.jsx
import React from "react";
import useImages from "../hooks/useImages";
import "../App.css"; // Import global CSS

const Home = () => {
    const { images, loading, error } = useImages("live music concert", 5);

    return (
        <div className="container">
            <h1 className="main-title">Welcome to Echo</h1>
            <p className="subtitle">
                Discover and book the best live music events near you. Experience the rhythm, feel the vibe.
            </p>

            {loading && <p className="loading">Loading images...</p>}
            {error && <p className="error">{error}</p>}

            <div className="image-gallery">
                {images.map((image) => (
                    <div key={image.id} className="image-container">
                        <img src={image.urls.regular} alt={image.alt_description} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
