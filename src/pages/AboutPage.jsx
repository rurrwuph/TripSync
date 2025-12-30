import React from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-6">
        <Link to="/" className="text-2xl font-bold text-black hover:text-gray-700">TripSync</Link>
      </header>

      {/* About Content */}
      <main className="flex-grow max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">About TripSync</h1>
        <p className="mb-4 text-lg text-gray-700">
          TripSync is an innovative online bus ticket booking system designed to make travel planning simple, fast, and reliable. Our platform allows users to search for available trips, select seats, and complete bookings seamlessly from anywhere.
        </p>
        <p className="mb-4 text-lg text-gray-700">
          With TripSync, you can explore bus routes, view real-time seat availability, and access accurate trip details. Our focus is on providing a user-friendly experience that saves time and ensures convenience for travelers.
        </p>
        <p className="mb-4 text-lg text-gray-700">
          We are committed to integrating advanced features like seat selection, chat assistance, and voice-enabled search to enhance user experience. TripSync aims to simplify bus travel while offering a trustworthy and enjoyable booking experience.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Vision</h2>
        <p className="text-lg text-gray-700">
          To become the most reliable and intuitive bus ticket booking platform, making travel planning effortless and accessible to everyone.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700">
          To provide a seamless online booking experience, enhance user satisfaction through advanced features, and foster convenience in intercity travel.
        </p>
      </main>
    </div>
  );
}
