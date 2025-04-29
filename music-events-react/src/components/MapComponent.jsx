// Uvoz potrebnih hook-ova i biblioteka
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import useImages from "../hooks/useImages";
import "leaflet/dist/leaflet.css";
import "../App.css";

// Lista unapred definisanih lokacija na kopnu za slučaj kada se ne pronađu koordinate
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

// Komponenta mape koja prima ime lokacije, naslov događaja, izvođača i cenu
const MapComponent = ({ locationName, eventTitle, performer, price }) => {
    // Stanje za koordinate koje će se koristiti za prikaz mape
    const [coordinates, setCoordinates] = useState(null);
    // Stanje koje označava da li se koristi fallback lokacija
    const [isFallback, setIsFallback] = useState(false);
    // Koristi useImages hook za preuzimanje slike povezane sa događajem (samo 1 slika)
    const { images, loading: imageLoading, error: imageError } = useImages(eventTitle, 1);

    // useEffect za preuzimanje koordinata na osnovu imena lokacije
    useEffect(() => {
        // Ako nije prosleđeno ime lokacije, ne radi ništa
        if (!locationName) return;

        const fetchCoordinates = async () => {
            try {
                // Slanje zahteva Nominatim API-ju za geokodiranje imena lokacije
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`
                );

                // Ako su pronađene koordinate, postavi ih u stanje
                if (response.data.length > 0) {
                    const { lat, lon } = response.data[0];
                    setCoordinates([parseFloat(lat), parseFloat(lon)]);
                    setIsFallback(false);
                } else {
                    // Ako nisu pronađene koordinate, ispiši upozorenje i koristi fallback lokaciju
                    console.warn(`No coordinates found for: ${locationName}. Using random land-based location.`);
                    setFallbackLocation();
                }
            } catch (error) {
                // U slučaju greške prilikom preuzimanja koordinata, ispiši grešku i koristi fallback
                console.error("Error fetching location coordinates:", error);
                setFallbackLocation();
            }
        };

        fetchCoordinates();
    }, [locationName]);

    // Funkcija koja postavlja fallback lokaciju (nasumično odabranu iz LAND_LOCATIONS)
    const setFallbackLocation = () => {
        const randomLocation = LAND_LOCATIONS[Math.floor(Math.random() * LAND_LOCATIONS.length)];
        setCoordinates([randomLocation.lat, randomLocation.lon]);
        setIsFallback(true);
    };

    // Komponenta koja ažurira prikaz mape kada se koordinate promene
    const UpdateMapView = ({ coords }) => {
        const map = useMap();
        useEffect(() => {
            if (coords) {
                // Postavlja centar mape i zoom nivo
                map.setView(coords, 10);
            }
        }, [coords, map]);
        return null;
    };

    // Definisanje prilagođene ikone markera
    const customIcon = new L.Icon({
        iconUrl: "/assets/custom-marker.png", // Proveri da li fajl postoji u public/assets
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [15, 5], // Pomera popup na stranu umesto iznad markera
    });

    return (
        <div className="map-container">
            {coordinates ? (
                <MapContainer center={coordinates} zoom={10} scrollWheelZoom={false} className="leaflet-map">
                    {/* Automatski ažuriraj prikaz mape kada se koordinate promene */}
                    <UpdateMapView coords={coordinates} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {/* Prikaz markera sa prilagođenom ikonom */}
                    <Marker position={coordinates} icon={customIcon}>
                        <Popup className="custom-popup">
                            <div className="popup-container">
                                {/* Prikaz slike preuzetih putem useImages hook-a */}
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
                                {/* Prikaz detalja događaja unutar popupa */}
                                <h3 className="popup-title">{eventTitle}</h3>
                                <p><strong>Performer:</strong> {performer}</p>
                                <p><strong>Location:</strong> {isFallback ? "Random City" : locationName}</p>
                                <p><strong>Price:</strong> ${price}</p>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            ) : (
                // Ako koordinate nisu učitane, prikazuje se poruka
                <p className="loading-text">Loading map...</p>
            )}
        </div>
    );
};

export default MapComponent;
