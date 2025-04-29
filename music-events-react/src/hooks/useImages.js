// Uvoz React hook-ova useState i useEffect
import { useState, useEffect } from "react";

// API ključ iz .env fajla za Unsplash
const UNSPLASH_API_KEY = process.env.REACT_APP_UNSPLASH_API_KEY;
// URL za pretragu slika na Unsplash-u
const UNSPLASH_URL = "https://api.unsplash.com/search/photos";

// URL za rezervnu sliku ukoliko ne pronađe nijednu sliku
const FALLBACK_IMAGE_URL = "https://via.placeholder.com/600x400?text=No+Image+Found";

// Custom hook koji pretražuje slike sa Unsplash-a
const useImages = (query, count = 4) => {
    // Definisanje stanja za slike, učitavanje i greške
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect se pokreće kada se promeni query ili count
    useEffect(() => {
        // Asinhrona funkcija za preuzimanje slika
        const fetchImages = async () => {
            // Provera da li postoji API ključ
            if (!UNSPLASH_API_KEY) {
                setError("Missing Unsplash API Key");
                setLoading(false);
                return;
            }

            try {
                // Prvi pokušaj: pretraživanje sa unetim upitom
                const response1 = await fetch(
                    `${UNSPLASH_URL}?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${UNSPLASH_API_KEY}`
                );
                if (!response1.ok) {
                    throw new Error(`Unsplash API Error: ${response1.status}`);
                }
                const data1 = await response1.json();

                // Ako su pronađene slike, postavi ih u stanje
                if (data1.results && data1.results.length > 0) {
                    setImages(data1.results);
                } else {
                    // Ako nema rezultata, loguj upozorenje i pokušaćemo sa podrazumevanim upitom "concert"
                    console.warn(`No images found for "${query}", trying default query "concert".`);
                    const response2 = await fetch(
                        `${UNSPLASH_URL}?query=concert&per_page=${count}&client_id=${UNSPLASH_API_KEY}`
                    );
                    if (!response2.ok) {
                        throw new Error(`Unsplash fallback API Error: ${response2.status}`);
                    }
                    const data2 = await response2.json();

                    // Ako su pronađene slike sa fallback upitom, postavi ih u stanje
                    if (data2.results && data2.results.length > 0) {
                        setImages(data2.results);
                    } else {
                        // Ako fallback upit takođe ne vrati slike, koristi rezervnu sliku
                        console.warn("No images found for fallback query. Using placeholder image.");
                        setImages([
                            {
                                id: "final-fallback",
                                urls: { regular: FALLBACK_IMAGE_URL },
                                alt_description: "No images found fallback",
                            },
                        ]);
                    }
                }
            } catch (err) {
                // U slučaju greške, loguj je i postavi rezervnu sliku
                console.error("Error fetching images:", err);
                setError("Failed to load images");
                setImages([
                    {
                        id: "error-fallback",
                        urls: { regular: FALLBACK_IMAGE_URL },
                        alt_description: "Error Fallback Image",
                    },
                ]);
            } finally {
                // Nakon završetka preuzimanja, postavi loading na false
                setLoading(false);
            }
        };

        // Pozovi funkciju za preuzimanje slika
        fetchImages();
    }, [query, count]);

    // Vraća stanje slika, učitavanje i eventualne greške
    return { images, loading, error };
};

export default useImages;
