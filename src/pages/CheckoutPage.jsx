import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import emailjs from '@emailjs/browser';
import { apiRequest } from "../services/api";

// =====================================================
// EMAIL TOGGLE: Set to true to enable automatic emails
// Set to false for testing/development
// =====================================================
const SEND_EMAIL_ENABLED = true;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    trip: incomingTrip,
    selectedSeats: incomingSeats,
    totalPrice: incomingPrice,
    paymentSuccess,
    booking: incomingBooking
  } = location.state || {};

  // Derive trip, selectedSeats, and totalPrice if they're missing but incomingBooking exists
  const trip = incomingTrip || (incomingBooking ? {
    from: incomingBooking.from,
    to: incomingBooking.to,
    time: incomingBooking.time,
    date: incomingBooking.date,
    type: incomingBooking.bus_name,
    price: incomingBooking.totalPrice / (incomingBooking.seats?.length || 1)
  } : null);

  const selectedSeats = incomingSeats || incomingBooking?.seats;
  const totalPrice = incomingPrice || incomingBooking?.totalPrice;

  const [successMessage, setSuccessMessage] = useState("");
  const bookingProcessed = useRef(false);

  const [isBooking, setIsBooking] = useState(false);
  const [booking, setBooking] = useState(incomingBooking || null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [popup, setPopup] = useState({ show: false, type: 'success', message: '' });
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 4000);
  };

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init("I-4Q5UdEcc6xNPUYo");

    if (paymentSuccess && !bookingProcessed.current) {
      console.log("Payment success detected. Triggering booking confirmation...");
      bookingProcessed.current = true;
      // If we already have a PENDING booking, confirm it. Else, book it normally.
      if (booking && booking.id) {
        handleConfirmBookingStatus(booking.id);
      } else {
        handleCreatePendingBooking(true); // create and confirm
      }
    }
  }, [paymentSuccess, booking]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    if (seconds === null) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendEmailTicket = (bookingId, currentUser) => {
    const SERVICE_ID = "service_dyzvgbf";
    const PUBLIC_KEY = "I-4Q5UdEcc6xNPUYo";
    // Using a placeholder template ID that user will likely replace
    const TEMPLATE_ID = "template_ticket_email";

    console.log("Preparing to send email to:", currentUser.email);

    // Generate QR Code URL
    const qrData = `TICKET|${bookingId}|${currentUser.phoneNumber || currentUser.email}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    const templateParams = {
      passenger_name: currentUser.full_name || currentUser.fullName || "Valued Customer",
      user_email: currentUser.email,
      email: currentUser.email, // Matching the {{email}} field in your dashboard
      origin: trip.from || trip.from_location || "Unknown",
      destination: trip.to || trip.to_location || "Unknown",
      date: trip.date || (trip.departure_time ? new Date(trip.departure_time).toLocaleDateString() : "TBD"),
      time: trip.time || (trip.departure_time ? new Date(trip.departure_time).toLocaleTimeString() : "TBD"),
      seats: selectedSeats.join(', '),
      total_fare: totalPrice,
      ticket_id: String(bookingId).slice(-8).toUpperCase(),
      qr_code: qrCodeUrl
    };

    console.log("Email Template Params:", templateParams);

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((res) => {
        console.log("TICKET EMAIL SENT SUCCESSFULLY!", res);
        showPopup('success', 'E-Ticket has been sent to your email!');
      })
      .catch((err) => {
        console.error("FAILED TO SEND TICKET EMAIL:", err);
        showPopup('error', 'Email sending failed. You can still view your e-ticket in Profile.');
      });
  };

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
    if (loggedInUser) setUser(loggedInUser);

    // Initialize timer if booking exists from state
    if (incomingBooking && incomingBooking.expiresAt && timeLeft === null) {
      const expiresAt = new Date(incomingBooking.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((expiresAt - now) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    }
  }, [incomingBooking, timeLeft]);

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


  const handleCreatePendingBooking = async (confirmImmediately = false) => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.email) {
      showPopup('error', 'Please login to book tickets.');
      navigate("/login");
      return;
    }

    try {
      setIsBooking(true);
      const response = await apiRequest("/tickets/book", {
        method: "POST",
        body: JSON.stringify({
          user_email: currentUser.email,
          trip_details: trip,
          selected_seats: selectedSeats,
          total_price: totalPrice
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data);

        // Start Timer
        const expiresAt = new Date(data.expires_at).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((expiresAt - now) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);

        if (confirmImmediately) {
          handleConfirmBookingStatus(data.id);
        } else {
          showPopup('success', 'Seats are now HELD for 2 minutes. Complete payment to confirm.');
        }
      } else {
        const errorData = await response.json();
        showPopup('error', `Booking failed: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      showPopup('error', 'Network error. Could not book tickets.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleConfirmBookingStatus = async (bookingId) => {
    try {
      setIsBooking(true);
      const response = await apiRequest(`/tickets/confirm/${bookingId}`, {
        method: "POST"
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(selectedSeats.join(", "));
        setTimeLeft(null); // Stop timer

        // Trigger Email Ticket (respects SEND_EMAIL_ENABLED flag)
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (SEND_EMAIL_ENABLED) {
          sendEmailTicket(data.id, currentUser);
        } else {
          console.log('Email sending disabled. Toggle SEND_EMAIL_ENABLED in CheckoutPage.jsx to enable.');
        }

        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        const errorData = await response.json();
        showPopup('error', `Confirmation failed: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Confirmation error:", error);
      showPopup('error', 'Payment confirmation failed.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 relative overflow-x-hidden">
      {/* Popup Toast */}
      {popup.show && (
        <div className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold ${popup.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`} style={{ animation: 'slideIn 0.3s ease-out forwards' }}>
          {popup.type === 'success' ? '✓' : '✕'} {popup.message}
        </div>
      )}
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
        <section className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 border border-gray-200 hover:shadow-xl relative overflow-hidden">
          {timeLeft !== null && timeLeft > 0 && (
            <div className="absolute top-0 right-0 bg-red-100 text-red-600 px-4 py-1 rounded-bl-xl font-bold animate-pulse">
              Hold expires in: {formatTime(timeLeft)}
            </div>
          )}
          {timeLeft === 0 && (
            <div className="absolute top-0 inset-x-0 bg-red-600 text-white py-1 text-center font-bold">
              HOLD EXPIRED - RELEASED
            </div>
          )}

          <p className="text-xl font-semibold">Total Price: ৳{totalPrice}</p>
          <div className="flex flex-col md:flex-row gap-4">

            {/* --- CONDITIONAL BUTTON LOGIC --- */}
            {user ? (
              <>
                <button
                  onClick={() => navigate('/payment/bkash', { state: { trip, selectedSeats, totalPrice, booking } })}
                  disabled={isBooking || paymentSuccess || (timeLeft === 0)}
                  className={`flex-1 py-3 md:px-8 bg-[#E2136E] text-white font-bold rounded-xl transform transition-all shadow-lg ${(isBooking || paymentSuccess || timeLeft === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#c2105e] hover:scale-105'
                    }`}
                >
                  {isBooking ? 'Processing...' : paymentSuccess ? 'Payment Successful' : 'Pay with bKash'}
                </button>

                {!booking && !paymentSuccess && (
                  <button
                    onClick={() => handleCreatePendingBooking(false)}
                    disabled={isBooking}
                    className="flex-1 py-3 md:px-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:scale-105 transform transition-all shadow-lg shadow-blue-200"
                  >
                    Pay Later (Hold Seats)
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-3 md:px-8 bg-black text-white font-bold rounded-xl hover:bg-gray-800 hover:scale-105 transform transition-all shadow-lg"
              >
                Login to Confirm Booking
              </button>
            )}

            <button
              onClick={() => navigate('/explore')}
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