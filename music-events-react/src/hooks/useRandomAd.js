// Uvoz hook-ova useState i useEffect iz React-a
import { useState, useEffect } from "react";

// Lista API URL-ova za preuzimanje reklama
const API_URLS = [
    "https://api.adviceslip.com/advice",
    "https://picsum.photos/400/300",
    "https://dummyjson.com/products?limit=100"
];

// Custom hook koji nasumično preuzima reklame
const useRandomAd = () => {
    // Stanje za čuvanje reklame (ad)
    const [ad, setAd] = useState(null);

    useEffect(() => {
        // Flag koji proverava da li je komponenta još uvek montirana
        let isMounted = true;

        // Asinhrona funkcija koja preuzima reklamu
        const fetchAd = async () => {
            try {
                // Nasumično izaberi jedan API iz liste
                const randomApi = API_URLS[Math.floor(Math.random() * API_URLS.length)];
                // Pošalji zahtev ka nasumično izabranom API-ju
                const response = await fetch(randomApi);
                
                // Ako odgovor nije OK, baci grešku
                if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

                // Preuzmi podatke iz odgovora
                let adData = await response.json();

                // Ako je komponenta još montirana, postavi reklamu u stanje
                if (isMounted) {
                    // Ako se koristi adviceslip API, uzmi savet kao tekst
                    if (randomApi.includes("adviceslip")) {
                        setAd({
                            text: adData.slip.advice,
                            image: "https://picsum.photos/400/300", // Koristi nasumičnu sliku kao rezervnu
                            link: "#"
                        });
                    } 
                    // Ako se koristi dummyjson API, nasumično izaberi proizvod
                    else if (randomApi.includes("dummyjson")) {
                        const randomProduct = adData.products[Math.floor(Math.random() * adData.products.length)];
                        setAd({
                            text: randomProduct.title,
                            image: randomProduct.thumbnail,
                            link: randomProduct.url || "#"
                        });
                    } 
                    // U suprotnom, koristi URL slike iz API-ja kao tekstualnu poruku
                    else {
                        setAd({
                            text: "Check this out!",
                            image: randomApi,
                            link: "#"
                        });
                    }
                }
            } catch (error) {
                // U slučaju greške, ispiši je u konzolu
                console.error("Error fetching ads:", error);
            }
        };

        // Postavi vremenski interval za prikaz reklame (nasumično između 5 i 20 sekundi)
        const adInterval = setTimeout(fetchAd, Math.random() * (20000 - 5000) + 5000);

        // Cleanup funkcija koja briše timeout i postavlja flag na false
        return () => {
            clearTimeout(adInterval);
            isMounted = false;
        };
    }, []); // Pokreće se samo jednom kada se komponenta montira

    // Vraća preuzetu reklamu
    return ad;
};

export default useRandomAd;
