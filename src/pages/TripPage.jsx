import React, { useEffect, useState } from "react";
import { useTrips } from "../context/TripContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TripDetails from "../components/TripDetails";
import allTrips from "../dummy/alltrips"



export default function TripPage() {
  // Master trip list (unchanged)
  // const allTrips = [...]

  const { searchResults, isSearchActive } = useTrips();
  const [trips, setTrips] = useState(allTrips);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  // Effect to update local trips when global search results change
  useEffect(() => {
    if (isSearchActive && searchResults.length > 0) {
      setTrips(searchResults);
    } else {
      // If no active search from bot, show default (allTrips)
      // Or you might want to keep showing what was there.
      // For now, let's behave such that if bot found something, we show it.
    }
  }, [searchResults, isSearchActive]);

  const handleSearch = () => {
    const filteredTrips = allTrips.filter((trip) => {
      const matchFrom = from
        ? trip.from.toLowerCase().includes(from.toLowerCase())
        : true;

      const matchTo = to
        ? trip.to.toLowerCase().includes(to.toLowerCase())
        : true;

      const matchDate = date ? trip.date === date : true;

      return matchFrom && matchTo && matchDate;
    });

    setTrips(filteredTrips);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      {/* Search Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-10 text-center">
            Search Trips
          </h2>

          <div className="bg-white rounded-3xl shadow-lg p-8 grid md:grid-cols-4 gap-6 mb-14">
            <input
              type="text"
              placeholder="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

            <input
              type="text"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

            <button
              onClick={handleSearch}
              className="bg-black text-white rounded-xl px-6 py-3 hover:bg-gray-800 transition"
            >
              Search
            </button>
          </div>

          {/* Trip Results */}
          <div className="space-y-6">
            {trips.length > 0 ? (
              trips.map((trip) => (
                <TripDetails key={trip.id} trip={trip} />
              ))
            ) : (
              <p className="text-center text-gray-500 text-lg">
                No trips found for your search.
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
