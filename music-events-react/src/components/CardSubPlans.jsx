import React from "react";
import "../App.css";

const CardSubPlans = ({ plan }) => {
    return (
        <div className="card-sub">
            <div className="card-icon">{plan.icon}</div>
            <h2 className="card-title">{plan.name}</h2>
            <p className="card-price">{plan.price}</p>
            <ul className="card-features">
                {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
            <button className="subscribe-btn" onClick={() => alert("...Subscrption not added yet...")}>Subscribe</button>
        </div>
    );
};

export default CardSubPlans;
