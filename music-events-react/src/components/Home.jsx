// src/pages/Home.jsx
import React, { useState } from "react";
import useImages from "../hooks/useImages";
import Lottie from "lottie-react";
import "../App.css";

// Import Lottie Animation
import hoverAnimation from "../animations/notes-animation.json"; 

// Define random sound files
const soundFiles = [
    "/assets/sound1.mp3",
    "/assets/sound2.mp3",
    "/assets/sound3.mp3",
    "/assets/sound4.mp3",
    "/assets/sound5.mp3",
];

const Home = () => {
    const { images, loading, error } = useImages("live music concert", 5);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const playRandomSound = () => {
        const randomIndex = Math.floor(Math.random() * soundFiles.length);
        const audio = new Audio(soundFiles[randomIndex]);

        // Attempt to play the sound and handle autoplay block
        audio.play().catch((error) => {
            console.log("Autoplay blocked, waiting for user interaction:", error);
            document.addEventListener("click", () => {
                audio.play();
            }, { once: true });
        });
    };

    return (
        <div className="container">
            <h1 className="main-title">Welcome to Echo</h1>
            <p className="subtitle">
                Discover and book the best live music events near you. Experience the rhythm, feel the vibe.
            </p>

            {loading && <p className="loading">Loading images...</p>}
            {error && <p className="error">{error}</p>}

            <div className="image-gallery">
                {images.map((image, index) => (
                    <div
                        key={image.id}
                        className="image-container"
                        onMouseEnter={() => {
                            setHoveredIndex(index);
                            playRandomSound();
                        }}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <img src={image.urls.regular} alt={image.alt_description} />
                        {hoveredIndex === index && (
                            <Lottie animationData={hoverAnimation} className="lottie-animation" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
