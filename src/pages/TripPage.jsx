import React, { useEffect, useState } from "react";
import { useTrips } from "../context/TripContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TripDetails from "../components/TripDetails";
import { searchTrips } from "../services/tripService";

export default function TripPage() {
  const { searchResults, isSearchActive } = useTrips();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Sorting State
  const [sortOption, setSortOption] = useState("default");

  // Sorting Logic
  const getSortedTrips = () => {
    let sorted = [...trips];
    switch (sortOption) {
      case "price_low":
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case "price_high":
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case "time_earliest":
        return sorted.sort((a, b) => parseTime(a.time) - parseTime(b.time));
      case "time_latest":
        return sorted.sort((a, b) => parseTime(b.time) - parseTime(a.time));
      default:
        return sorted;
    }
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10); // Return minutes from midnight
  };

  const sortedTrips = getSortedTrips();

  // Pagination Logic (Applied on sortedTrips)
  const indexOfLastTrip = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstTrip = indexOfLastTrip - ITEMS_PER_PAGE;
  const paginatedTrips = sortedTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(sortedTrips.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Effect to update local trips when global search results change
  useEffect(() => {
    if (isSearchActive && searchResults.length > 0) {
      setTrips(searchResults);
      setCurrentPage(1); // Reset to first page on new global search
    }
  }, [searchResults, isSearchActive]);

  const handleSearch = async () => {
    if (!from || !to || !date) {
      alert("Please fill in all fields (From, To, Date)");
      return;
    }

    setLoading(true);
    setError(null);
    setTrips([]);
    setCurrentPage(1); // Reset to first page on new manual search

    try {
      const results = await searchTrips(from, to, date);
      setTrips(results);
    } catch (err) {
      setError("Failed to fetch bus trips. Please check the backend or try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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

          {/* Sorting Controls */}
          {trips.length > 0 && !loading && (
            <div className="flex justify-end mb-6">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:outline-none focus:border-black"
              >
                <option value="default">Sort By: Default</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="time_earliest">Time: Earliest First</option>
                <option value="time_latest">Time: Latest First</option>
              </select>
            </div>
          )}

          {/* Trip Results */}
          <div className="space-y-6">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-lg text-gray-600">Searching live bus data...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-center">
                {error}
              </div>
            )}

            {!loading && !error && (
              trips.length > 0 ? (
                <>
                  {paginatedTrips.map((trip, index) => (
                    <TripDetails key={`${trip.id}-${index}`} trip={trip} />
                  ))}

                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-6 py-2 rounded-full border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-100'}`}
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-6 py-2 rounded-full border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 text-lg">
                  {from && to ? "No trips found for this route." : "Enter a route and date to find buses."}
                </p>
              )
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
