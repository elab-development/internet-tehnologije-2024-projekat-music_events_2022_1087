// src/components/AdPopup.jsx
import React, { useState } from "react";
import useRandomAd from "../hooks/useRandomAd";
import { AiOutlineClose } from "react-icons/ai"; // React Icons for Close Button
import "../App.css";

const AdPopup = () => {
    const ad = useRandomAd();
    const [visible, setVisible] = useState(true);

    if (!ad || !visible) return null;

    return (
        <div className="ad-popup">
            <button className="close-btn" onClick={() => setVisible(false)}>
                <AiOutlineClose />
            </button>
            <a href={ad.link} target="_blank" rel="noopener noreferrer">
                <img src={ad.image} alt="Advertisement" />
                <p>{ad.text}</p>
            </a>
        </div>
    );
};

export default AdPopup;
