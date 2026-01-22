import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const initialUserData = {
  fullName: 'Loading...',
  email: 'loading@tripsync.com',
  phoneNumber: 'N/A',
  accountType: 'Pending',
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(initialUserData);
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelCause, setCancelCause] = useState('Change of plans');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      const loggedInUser = localStorage.getItem('currentUser');
      if (!loggedInUser) {
        navigate('/login');
        return;
      }

      try {
        const user = JSON.parse(loggedInUser);
        setUserData({
          fullName: user.fullname || 'TripSync User',
          email: user.email,
          phoneNumber: user.phone || 'Not provided',
          accountType: user.role === 'admin' ? 'Administrator Account' : 'Passenger Account',
        });

        const response = await fetch(`http://localhost:8000/tickets/user/${user.email}`);
        if (response.ok) {
          const data = await response.json();

          // Grouping seats by Trip ID
          const groupedData = data.reduce((acc, ticket) => {
            const tripId = ticket.trip_id;
            const trip = ticket.trip || {};

            if (!acc[tripId]) {
              const dateObj = new Date(trip.departure_time);
              const [fromCity, toCity] = (trip.route || "Unknown - Unknown").split("-").map(s => s.trim());

              acc[tripId] = {
                id: tripId,
                from: fromCity,
                to: toCity,
                date: dateObj.toLocaleDateString(),
                time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                seats: [],
                totalPrice: 0,
                bookedAt: trip.departure_time,
                tickets: [] // Store individual ticket details
              };
            }

            acc[tripId].seats.push(ticket.seat_number);
            acc[tripId].totalPrice += trip.base_fare;
            acc[tripId].tickets.push({
              id: ticket.id,
              seat: ticket.seat_number,
              amount: trip.base_fare,
              status: ticket.status
            });
            return acc;
          }, {});

          // Sort by newest date first
          const sortedBookings = Object.values(groupedData).sort((a, b) => {
            return new Date(b.bookedAt) - new Date(a.bookedAt);
          });

          setBookings(sortedBookings);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const submitCancellation = async () => {
    if (!selectedBooking) return;
    setIsSubmitting(true);

    try {
      const ticketIds = selectedBooking.tickets.map(t => t.id);
      const seatNumbers = selectedBooking.tickets.map(t => t.seat);

      const response = await fetch('http://localhost:8000/refunds/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_ids: ticketIds,
          seat_numbers: seatNumbers,
          user_email: userData.email,
          amount: selectedBooking.totalPrice,
          cause: cancelCause,
          status: 'pending'
        })
      });

      if (response.ok) {
        // Update local UI
        setBookings(prev => prev.map(b =>
          b.id === selectedBooking.id
            ? { ...b, tickets: b.tickets.map(t => ({ ...t, status: 'CANCELLATION PENDING' })) }
            : b
        ));
        setIsModalOpen(false);
        setSelectedBooking(null);
      } else {
        alert("Failed to cancel tickets. Please try again.");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      alert("An error occurred during cancellation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  // Check if booking is in the future
  const isFutureTrip = (bookedAt) => {
    return new Date(bookedAt) > new Date();
  };

  // Check if all tickets in a booking are pending cancellation
  const isPendingCancellation = (booking) => {
    return booking.tickets.every(t => t.status === 'CANCELLATION PENDING' || t.status === 'cancelled');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-grow py-12 px-6">
        {/* Anti-gravity Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-float-up">
              <h3 className="text-2xl font-bold mb-4 text-black">Cancel Ticket</h3>
              <p className="text-gray-600 mb-6">Please select the reason for your cancellation. This will help us improve our service.</p>

              <div className="space-y-4 mb-8">
                <label className="block text-sm font-semibold text-gray-700">Reason for Cancellation</label>
                <div className="relative">
                  <select
                    value={cancelCause}
                    onChange={(e) => setCancelCause(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none transition text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="Change of plans">Change of plans</option>
                    <option value="Found cheaper option">Found cheaper option</option>
                    <option value="Booking mistake">Booking mistake</option>
                    <option value="Personal emergency">Personal emergency</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold border border-gray-100 hover:bg-gray-50 transition text-gray-700"
                  disabled={isSubmitting}
                >
                  Keep Booking
                </button>
                <button
                  onClick={submitCancellation}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold bg-black text-white hover:bg-gray-800 transition shadow-lg shadow-black/20 flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT COLUMN: User Profile Card */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center border border-gray-100">
              <div className="w-24 h-24 mx-auto rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
                {getAvatarInitial(userData.fullName)}
              </div>
              <h2 className="text-xl font-bold">{userData.fullName}</h2>
              <p className="text-sm text-gray-500 mb-6">{userData.accountType}</p>

              <div className="space-y-4 text-left">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                  <p className="text-sm font-medium truncate">{userData.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Phone</p>
                  <p className="text-sm font-medium">{userData.phoneNumber}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition">
                  Edit Profile
                </button>
                {userData.accountType === 'Administrator Account' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                  >
                    Admin Dashboard
                  </button>
                )}
                <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition">
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Ticket History */}
          <div className="md:col-span-8 lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">My Trips</h3>
              <span className="bg-white px-3 py-1 rounded-full text-xs font-medium border border-gray-200 shadow-sm">
                {bookings.length} Bookings
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <h4 className="text-xl font-bold mb-2">No trips found</h4>
                <p className="text-gray-500 mb-6">You have not booked any bus tickets yet.</p>
                <button onClick={() => navigate('/explore')} className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                  Book a Trip
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const pending = isPendingCancellation(booking);
                  const isFuture = isFutureTrip(booking.bookedAt);

                  return (
                    <div key={booking.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-grow">
                        <div className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">
                          {new Date(booking.bookedAt).toLocaleDateString()}
                        </div>
                        <h4 className="text-xl font-bold mb-1 font-outfit">
                          {booking.from} <span className="text-gray-300 mx-2">&rarr;</span> {booking.to}
                        </h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center gap-1">Date: {booking.date}</span>
                          <span className="flex items-center gap-1">Time: {booking.time}</span>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end justify-center min-w-[140px]">
                        <div className="text-2xl font-bold mb-1">৳{booking.totalPrice}</div>
                        <div className="text-sm text-gray-500 mb-3">
                          Seats: <span className="font-semibold text-black">{booking.seats.sort().join(', ')}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {isFuture && !pending && (
                            <button
                              onClick={() => handleCancelClick(booking)}
                              className="px-4 py-1.5 rounded-full border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition"
                            >
                              Cancel Ticket
                            </button>
                          )}
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${pending
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                            : 'bg-green-50 text-green-700 border-green-100'
                            }`}>
                            {pending ? 'CANCELLATION PENDING' : 'CONFIRMED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes floatUp {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-float-up {
          animation: floatUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;