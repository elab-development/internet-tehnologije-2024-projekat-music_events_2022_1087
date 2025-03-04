import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import useImages from "../hooks/useImages";
import "leaflet/dist/leaflet.css";
import "../App.css";

// 🔥 Predefined land-based locations for fallback
const LAND_LOCATIONS = [
    { name: "New York, USA", lat: 40.7128, lon: -74.0060 },
    { name: "London, UK", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo, Japan", lat: 35.682839, lon: 139.759455 },
    { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093 },
    { name: "Berlin, Germany", lat: 52.5200, lon: 13.4050 },
    { name: "Rio de Janeiro, Brazil", lat: -22.9068, lon: -43.1729 },
    { name: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241 },
    { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
];

const MapComponent = ({ locationName, eventTitle, performer, price }) => {
    const [coordinates, setCoordinates] = useState(null);
    const [isFallback, setIsFallback] = useState(false); // 🔥 Tracks if fallback is used
    const { images, loading: imageLoading, error: imageError } = useImages(eventTitle, 1);

    useEffect(() => {
        if (!locationName) return;

        const fetchCoordinates = async () => {
            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`
                );

                if (response.data.length > 0) {
                    const { lat, lon } = response.data[0];
                    setCoordinates([parseFloat(lat), parseFloat(lon)]);
                    setIsFallback(false);
                } else {
                    console.warn(`No coordinates found for: ${locationName}. Using random land-based location.`);
                    setFallbackLocation(); // 🔥 Use predefined land location only if failed
                }
            } catch (error) {
                console.error("Error fetching location coordinates:", error);
                setFallbackLocation(); // 🔥 Use fallback only if request fails
            }
        };

        fetchCoordinates();
    }, [locationName]);

    // 🔥 Function to set a land-based fallback location
    const setFallbackLocation = () => {
        const randomLocation = LAND_LOCATIONS[Math.floor(Math.random() * LAND_LOCATIONS.length)];
        setCoordinates([randomLocation.lat, randomLocation.lon]);
        setIsFallback(true);
    };

    // 🔥 Function to update map view dynamically
    const UpdateMapView = ({ coords }) => {
        const map = useMap();
        useEffect(() => {
            if (coords) {
                map.setView(coords, 10);
            }
        }, [coords, map]);
        return null;
    };

    // 🔥 Custom marker icon
    const customIcon = new L.Icon({
        iconUrl: "/assets/custom-marker.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [15, 5], // Moves the popup **to the side**
    });

    return (
        <div className="map-container">
            {coordinates ? (
                <MapContainer center={coordinates} zoom={10} scrollWheelZoom={false} className="leaflet-map">
                    <UpdateMapView coords={coordinates} /> {/* 🔥 Adjust zoom dynamically */}
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={coordinates} icon={customIcon}>
                        <Popup className="custom-popup">
                            <div className="popup-container">
                                {imageLoading ? (
                                    <p>Loading image...</p>
                                ) : imageError || !images.length ? (
                                    <p>No image available.</p>
                                ) : (
                                    <img
                                        src={images[0].urls.thumb}
                                        alt={eventTitle}
                                        className="popup-image"
                                    />
                                )}
                                <h3 className="popup-title">{eventTitle}</h3>
                                <p><strong>Performer:</strong> {performer}</p>
                                <p><strong>Location:</strong> {isFallback ? "Random City" : locationName}</p>
                                <p><strong>Price:</strong> ${price}</p>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            ) : (
                <p className="loading-text">Loading map...</p>
            )}
        </div>
    );
};

export default MapComponent;
