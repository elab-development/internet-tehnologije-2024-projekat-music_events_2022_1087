import { useState, useEffect } from "react";

const UNSPLASH_API_KEY = process.env.REACT_APP_UNSPLASH_API_KEY; 
const UNSPLASH_URL = "https://api.unsplash.com/search/photos";

const useImages = (query, count = 4) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            if (!UNSPLASH_API_KEY) {
                setError("Missing API Key");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${UNSPLASH_URL}?query=${query}&per_page=${count}&client_id=${UNSPLASH_API_KEY}`
                );
                const data = await response.json();
                setImages(data.results || []);
            } catch (err) {
                setError("Failed to load images");
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [query, count]);

    return { images, loading, error };
};

export default useImages;
