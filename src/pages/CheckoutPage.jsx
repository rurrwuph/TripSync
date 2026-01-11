import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trip, selectedSeats, totalPrice, paymentSuccess } = location.state || {};
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (paymentSuccess) {
      handleConfirmBooking();
    }
  }, [paymentSuccess]);

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
    if (loggedInUser) setUser(loggedInUser);
  }, []);

  // --- Handlers for Header Dropdown ---
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setMenuOpen(false);
    navigate("/login");
  };

  // Error handling if no trip data
  if (!trip || !selectedSeats) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl text-red-500">
            No trip selected. Please go back and select a trip.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const savedSeats = JSON.parse(localStorage.getItem(`bookedSeats_trip_${trip.id}`)) || [];
  const [bookedSeats, setBookedSeats] = useState(savedSeats);

  const handleConfirmBooking = async () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.email) {
      alert("Please login to book tickets.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/tickets/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: currentUser.email,
          trip_details: trip, // Ensure 'trip' object has all necessary fields including 'date'
          selected_seats: selectedSeats,
          total_price: totalPrice
        }),
      });

      if (response.ok) {
        // Update local storage for immediate UI reflection (optional but good for consistency)
        const updatedSeats = [...bookedSeats, ...selectedSeats];
        setBookedSeats(updatedSeats);
        localStorage.setItem(
          `bookedSeats_trip_${trip.id}`,
          JSON.stringify(updatedSeats)
        );

        // --- Save to User History in Local Storage (Legacy/Frontend Cache) ---
        // You might want to fetch this from API later, but keeping it for now doesn't hurt.
        const bookingRecord = {
          id: Date.now(),
          tripId: trip.id,
          from: trip.from,
          to: trip.to,
          date: trip.date || "N/A",
          time: trip.time,
          seats: selectedSeats,
          totalPrice: totalPrice,
          bookedAt: new Date().toISOString()
        };
        const userHistoryKey = `tripSync_bookings_${currentUser.email}`;
        const existingHistory = JSON.parse(localStorage.getItem(userHistoryKey)) || [];
        localStorage.setItem(userHistoryKey, JSON.stringify([bookingRecord, ...existingHistory]));

        setSuccessMessage(selectedSeats.join(", "));
        setTimeout(() => setSuccessMessage(""), 4000);

      } else {
        const errorData = await response.json();
        alert(`Booking failed: ${errorData.detail}`);
      }

    } catch (error) {
      console.error("Booking error:", error);
      alert("Network error. Could not book tickets.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 relative overflow-x-hidden">
      {/* --- START: SUCCESS POPUP --- */}
      {successMessage && (
        <div className="fixed top-24 left-0 right-0 z-50 flex justify-center px-4">
          <div className="bg-white border-l-8 border-green-500 rounded-xl shadow-2xl p-6 w-full max-w-lg flex items-start gap-5 relative overflow-hidden">
            {/* Background Visual */}
            <div className="absolute -right-10 -top-10 text-green-50 opacity-20 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-40 w-40" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            {/* Icon */}
            <div className="flex-shrink-0 relative z-10">
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            {/* Text */}
            <div className="flex-1 pt-1 relative z-10">
              <h4 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h4>
              <p className="text-gray-600 mt-2 text-lg">
                Your seats <span className="font-semibold text-green-700">{successMessage}</span> have been successfully booked.
              </p>
              <p className="text-sm text-gray-400 mt-4 mb-2">Check your profile for ticket details.</p>
              <button onClick={() => navigate('/profile')} className="text-[#E2136E] font-bold hover:underline">
                View My Tickets &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- END: POPUP --- */}

      <header className="bg-white border-b border-gray-200 py-5 shadow">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TripSync</h1>
          <div className="flex gap-4">
            <Link to={"/"} className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition">
              Home
            </Link>
            {!user ? (
              <div className="flex gap-4">
                <Link to="/login" className="px-6 py-2 rounded-full border border-gray-300 hover:border-black transition">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition">
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center"
                >
                  {user.fullname ? user.fullname[0].toUpperCase() : "U"}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg flex flex-col z-50">
                    <button onClick={() => { navigate("/profile"); setMenuOpen(false); }} className="px-4 py-2 hover:bg-gray-100 text-left">
                      View Profile
                    </button>
                    <button onClick={handleSwitchAccount} className="px-4 py-2 hover:bg-gray-100 text-left">
                      Switch Account
                    </button>
                    <button onClick={handleLogout} className="px-4 py-2 hover:bg-gray-100 text-left text-red-500">
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-transparent bg-clip-text">
          Checkout
        </h2>

        {/* Trip Summary */}
        <section className="bg-white rounded-3xl shadow-2xl p-10 mb-10 border border-gray-200 hover:shadow-xl">
          <h3 className="text-2xl font-semibold mb-4">Trip Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-gray-700">
            <p><span className="font-semibold">From:</span> {trip.from}</p>
            <p><span className="font-semibold">To:</span> {trip.to}</p>
            <p><span className="font-semibold">Departure:</span> {trip.time}</p>
            <p><span className="font-semibold">Bus Type:</span> {trip.type}</p>
            <p><span className="font-semibold">Price per seat:</span> ৳{trip.price}</p>
            <p><span className="font-semibold">Seats Selected:</span> {selectedSeats.join(", ")}</p>
          </div>
        </section>

        {/* Total Price & Actions */}
        <section className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 border border-gray-200 hover:shadow-xl">
          <p className="text-xl font-semibold">Total Price: ৳{totalPrice}</p>
          <div className="flex flex-col md:flex-row gap-4">

            {/* --- CONDITIONAL BUTTON LOGIC --- */}
            {user ? (
              <button
                onClick={() => navigate('/payment/bkash', { state: { trip, selectedSeats, totalPrice } })}
                className="flex-1 py-3 md:px-8 bg-[#E2136E] text-white font-bold rounded-xl hover:bg-[#c2105e] hover:scale-105 transform transition-all shadow-lg"
              >
                Pay with bKash
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-3 md:px-8 bg-black text-white font-bold rounded-xl hover:bg-gray-800 hover:scale-105 transform transition-all shadow-lg"
              >
                Login to Confirm Booking
              </button>
            )}

            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 md:px-8 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 hover:scale-105 transform transition-all shadow-lg"
            >
              Back
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;