import React from "react";
import { FaTicketAlt, FaStar, FaCrown, FaGem } from "react-icons/fa";
import CardSubPlans from "./CardSubPlans"; // Reusable Subscription Card Component
import "../App.css";

const plans = [
    {
        name: "Free",
        price: "$0/mo",
        features: ["Limited Deals", "Ads Included"],
        icon: <FaTicketAlt />,
    },
    {
        name: "Premium",
        price: "$9.99/mo",
        features: ["No Ads", "10% Discount on Bookings"],
        icon: <FaStar />,
    },
    {
        name: "Gold",
        price: "$19.99/mo",
        features: ["No Ads", "15% Discount", "Free 5th Ticket"],
        icon: <FaCrown />,
    },
    {
        name: "Platinum",
        price: "$29.99/mo",
        features: ["20% Discount", "Pre-Booking Access", "Free 4th Ticket"],
        icon: <FaGem />,
    },
];

const SubscriptionPlan = () => {
    return (
        <div className="subscription-container">
            <h1 className="subscription-title">Choose Your Plan</h1>
            <div className="subscription-row">
                {plans.map((plan, index) => (
                    <CardSubPlans key={index} plan={plan} />
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPlan;
