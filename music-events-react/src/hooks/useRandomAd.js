// src/hooks/useRandomAd.js
import { useState, useEffect } from "react";

const API_URLS = [
    "https://api.adviceslip.com/advice",
    "https://picsum.photos/400/300",
    "https://dummyjson.com/products?limit=100"
];

const useRandomAd = () => {
    const [ad, setAd] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchAd = async () => {
            try {
                const randomApi = API_URLS[Math.floor(Math.random() * API_URLS.length)];
                const response = await fetch(randomApi);
                
                if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

                let adData = await response.json();

                if (isMounted) {
                    if (randomApi.includes("adviceslip")) {
                        setAd({
                            text: adData.slip.advice,
                            image: "https://picsum.photos/400/300", // Placeholder
                            link: "#"
                        });
                    } else if (randomApi.includes("dummyjson")) {
                        const randomProduct = adData.products[Math.floor(Math.random() * adData.products.length)];
                        setAd({
                            text: randomProduct.title,
                            image: randomProduct.thumbnail,
                            link: randomProduct.url || "#"
                        });
                    } else {
                        setAd({
                            text: "Check this out!",
                            image: randomApi,
                            link: "#"
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching ads:", error);
            }
        };

        // Show an ad at a **random interval**
        const adInterval = setTimeout(fetchAd, Math.random() * (20000 - 5000) + 5000); // Between 5s and 20s

        return () => {
            clearTimeout(adInterval);
            isMounted = false;
        };
    }, []); // 🔥 Ensures it runs **only once** when mounted

    return ad;
};

export default useRandomAd;
