import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

  const [searchParams, setSearchParams] = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Sorting and Filtering State
  const [sortOption, setSortOption] = useState("default");
  const [timeFilter, setTimeFilter] = useState("all");

  // Filtering and Sorting Logic
  const getProcessedTrips = () => {
    let processed = [...trips];

    // 1. Time Filtering
    if (timeFilter !== "all") {
      processed = processed.filter(trip => {
        const t = parseTime(trip.time);
        if (timeFilter === "morning") return t >= 360 && t < 720; // 6 AM - 12 PM
        if (timeFilter === "afternoon") return t >= 720 && t < 1080; // 12 PM - 6 PM
        if (timeFilter === "evening") return t >= 1080 && t < 1439; // 6 PM - 12 AM
        if (timeFilter === "night") return t >= 0 && t < 360; // 12 AM - 6 AM
        return true;
      });
    }

    // 2. Sorting
    switch (sortOption) {
      case "price_low":
        processed.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price_high":
        processed.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "time_earliest":
        processed.sort((a, b) => parseTime(a.time) - parseTime(b.time));
        break;
      case "time_latest":
        processed.sort((a, b) => parseTime(b.time) - parseTime(a.time));
        break;
      default:
        break;
    }
    return processed;
  };

  const BANGLADESH_CITIES = [
    "Dhaka", "Chittagong", "Cox's Bazar", "Sylhet", "Rajshahi",
    "Khulna", "Barisal", "Rangpur", "Bogra", "Jashore"
  ].sort();

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

  const processedTrips = getProcessedTrips();

  // Pagination Logic (Applied on processedTrips)
  const indexOfLastTrip = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstTrip = indexOfLastTrip - ITEMS_PER_PAGE;
  const paginatedTrips = processedTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(processedTrips.length / ITEMS_PER_PAGE);

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

  // Effect to handle URL params search
  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const dateParam = searchParams.get("date");

    if (fromParam && toParam && dateParam) {
      setFrom(fromParam);
      setTo(toParam);
      setDate(dateParam);

      // Always search if params exist (and differ from current or just initial load)
      // We rely on the internal loading check of the handler or UI to prevent spam
      if (!loading) {
        handleSearchFromParams(fromParam, toParam, dateParam);
      }
    }
  }, [searchParams]);

  // Separate search handler for params to avoid closure staleness
  const handleSearchFromParams = async (o, d, dt) => {
    setLoading(true);
    setError(null);
    setTrips([]);
    setCurrentPage(1);
    try {
      const results = await searchTrips(o, d, dt);
      setTrips(results);
    } catch (err) {
      setError("Failed to fetch bus trips. Please check connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Effect to update local trips when global search results change
  useEffect(() => {
    if (isSearchActive && searchResults.length > 0) {
      console.log("Global search results detected");
      setTrips(searchResults);
      setCurrentPage(1);
    }
  }, [searchResults, isSearchActive]);

  const handleSearch = async () => {
    if (!from || !to || !date) {
      alert("Please fill in all fields (From, To, Date)");
      return;
    }

    // Update URL params; this will trigger the useEffect to perform the actual search
    setSearchParams({ from, to, date });
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

            {/* From Input with Datalist */}
            <div className="relative">
              <input
                list="from-cities"
                type="text"
                placeholder="From (e.g. Dhaka)"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
              />
              <datalist id="from-cities">
                {BANGLADESH_CITIES.map(city => (
                  <option key={`from-${city}`} value={city} />
                ))}
              </datalist>
            </div>

            {/* To Input with Datalist */}
            <div className="relative">
              <input
                list="to-cities"
                type="text"
                placeholder="To (e.g. Chittagong)"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
              />
              <datalist id="to-cities">
                {BANGLADESH_CITIES.map(city => (
                  <option key={`to-${city}`} value={city} />
                ))}
              </datalist>
            </div>

            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
            />

            <button
              onClick={handleSearch}
              className="bg-black text-white rounded-xl px-6 py-3 hover:bg-gray-800 transition"
            >
              Search
            </button>
          </div>

          {/* Filter and Sorting Controls */}
          {trips.length > 0 && !loading && (
            <div className="flex flex-wrap justify-end gap-4 mb-8">
              <select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:outline-none focus:border-black"
              >
                <option value="all">Check Time: All</option>
                <option value="morning">Morning (Before 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                <option value="evening">Evening (6 PM - 12 AM)</option>
                <option value="night">Late Night (After 12 AM)</option>
              </select>

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
