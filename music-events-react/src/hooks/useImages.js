// src/hooks/useImages.js
import { useState, useEffect } from "react";

// Replace this with your actual Unsplash API key in .env as REACT_APP_UNSPLASH_API_KEY
const UNSPLASH_API_KEY = process.env.REACT_APP_UNSPLASH_API_KEY;
const UNSPLASH_URL = "https://api.unsplash.com/search/photos";

// Fallback image if both queries fail
const FALLBACK_IMAGE_URL = "https://via.placeholder.com/600x400?text=No+Image+Found";

const useImages = (query, count = 4) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            if (!UNSPLASH_API_KEY) {
                setError("Missing Unsplash API Key");
                setLoading(false);
                return;
            }

            try {
                // 1️⃣ Attempt first query
                const response1 = await fetch(
                    `${UNSPLASH_URL}?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${UNSPLASH_API_KEY}`
                );
                if (!response1.ok) {
                    throw new Error(`Unsplash API Error: ${response1.status}`);
                }
                const data1 = await response1.json();

                if (data1.results && data1.results.length > 0) {
                    // ✅ We found images for the user's query
                    setImages(data1.results);
                } else {
                    // 2️⃣ Fallback to default query "concert"
                    console.warn(`No images found for "${query}", trying default query "concert".`);

                    const response2 = await fetch(
                        `${UNSPLASH_URL}?query=concert&per_page=${count}&client_id=${UNSPLASH_API_KEY}`
                    );
                    if (!response2.ok) {
                        throw new Error(`Unsplash fallback API Error: ${response2.status}`);
                    }
                    const data2 = await response2.json();

                    if (data2.results && data2.results.length > 0) {
                        // ✅ Found images for fallback query
                        setImages(data2.results);
                    } else {
                        // 3️⃣ Final fallback image
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
                console.error("Error fetching images:", err);
                setError("Failed to load images");
                // Provide a fallback if there's an error
                setImages([
                    {
                        id: "error-fallback",
                        urls: { regular: FALLBACK_IMAGE_URL },
                        alt_description: "Error Fallback Image",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [query, count]);

    return { images, loading, error };
};

export default useImages;
