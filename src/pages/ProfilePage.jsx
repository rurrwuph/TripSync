import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useReactToPrint } from "react-to-print";
import ETicket from "../components/ETicket";

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

  // Printing Logic States & Refs
  const [ticketToPrint, setTicketToPrint] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const ticketRef = useRef(null);

  /**
   * IMPORTANT: Hooks must be called at the top level of the component.
   * This setup is compatible with react-to-print v3.0+
   */
  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: 'TripSync-E-Ticket',
  });

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

          // Grouping individual seat tickets by Trip ID
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
                bus_name: trip.bus_name || "Green Line AC",
                tickets: []
              };
            }

            acc[tripId].seats.push(ticket.seat_number);
            acc[tripId].totalPrice += trip.base_fare;
            acc[tripId].tickets.push({
              id: ticket.id,
              seat: ticket.seat_number,
              amount: trip.base_fare,
              status: ticket.status,
              refund_status: ticket.refund_status
            });
            return acc;
          }, {});

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
        setBookings(prev => prev.map(b =>
          b.id === selectedBooking.id
            ? {
              ...b,
              tickets: b.tickets.map(t => ({
                ...t,
                status: 'cancelled',
                refund_status: 'pending'
              }))
            }
            : b
        ));
        setIsModalOpen(false);
        setSelectedBooking(null);
      } else {
        alert("Failed to cancel tickets.");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTicketPreview = (booking) => {
    const ticketData = {
      origin: booking.from,
      destination: booking.to,
      date: booking.date,
      time: booking.time,
      price: booking.totalPrice,
      bus_name: booking.bus_name,
      id: booking.id,
      seats: booking.seats
    };

    setTicketToPrint(ticketData);
    setIsTicketModalOpen(true);
  };

  const getAvatarInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';
  const isFutureTrip = (bookedAt) => new Date(bookedAt) > new Date();

  const getBookingStatus = (booking) => {
    const refundStatuses = booking.tickets.map(t => t.refund_status).filter(Boolean);
    if (refundStatuses.length > 0) {
      const status = refundStatuses[0];
      if (status === 'pending') return 'CANCELLATION PENDING';
      if (status === 'approved') return 'REFUNDED';
      if (status === 'rejected') return 'REJECTED';
    }
    if (booking.tickets.some(t => t.status === 'cancelled')) return 'CANCELLED';
    return 'CONFIRMED';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Header />

      <main className="flex-grow py-12 px-6">
        {/* Cancellation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-float-up">
              <h3 className="text-2xl font-bold mb-4">Cancel Ticket</h3>
              <p className="text-gray-600 mb-6">Why are you cancelling this booking?</p>

              <select
                value={cancelCause}
                onChange={(e) => setCancelCause(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none mb-8"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Found cheaper option">Found cheaper option</option>
                <option value="Booking mistake">Booking mistake</option>
                <option value="Personal emergency">Personal emergency</option>
              </select>

              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-700">Back</button>
                <button
                  onClick={submitCancellation}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-black text-white rounded-2xl font-bold"
                >
                  {isSubmitting ? "Processing..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center border border-gray-100">
              <div className="w-24 h-24 mx-auto rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold mb-4">
                {getAvatarInitial(userData.fullName)}
              </div>
              <h2 className="text-xl font-bold">{userData.fullName}</h2>
              <p className="text-sm text-gray-500 mb-6">{userData.accountType}</p>
              <div className="space-y-4 text-left">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Email</p>
                  <p className="text-sm font-medium truncate">{userData.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Phone</p>
                  <p className="text-sm font-medium">{userData.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="md:col-span-8 lg:col-span-9">
            <h3 className="text-2xl font-bold mb-6">My Trips</h3>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <p className="text-gray-500">No trips booked yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const statusLabel = getBookingStatus(booking);
                  const isFuture = isFutureTrip(booking.bookedAt);
                  const canCancel = isFuture && statusLabel === 'CONFIRMED';

                  let badgeColor = 'bg-green-50 text-green-700 border-green-100';
                  if (statusLabel.includes('PENDING')) badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-100';
                  if (statusLabel === 'REFUNDED' || statusLabel === 'CANCELLED') badgeColor = 'bg-red-50 text-red-700 border-red-100';

                  return (
                    <div key={booking.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                      <div>
                        <div className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">
                          {booking.date}
                        </div>
                        <h4 className="text-xl font-bold mb-1">
                          {booking.from} <span className="text-gray-300 mx-2">➜</span> {booking.to}
                        </h4>
                        <div className="text-sm text-gray-600">
                          {booking.bus_name} • {booking.time}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end justify-center">
                        <div className="text-2xl font-black mb-1">৳{booking.totalPrice}</div>
                        <div className="text-sm text-gray-500 mb-3">
                          Seats: <span className="font-semibold text-black">{booking.seats.sort().join(', ')}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {statusLabel === 'CONFIRMED' && (
                            <button
                              onClick={() => openTicketPreview(booking)}
                              className="px-4 py-1.5 rounded-full border border-blue-200 text-blue-600 text-xs font-bold hover:bg-blue-50 transition"
                            >
                              E-Ticket
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => handleCancelClick(booking)}
                              className="px-4 py-1.5 rounded-full border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition"
                            >
                              Cancel
                            </button>
                          )}
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badgeColor}`}>
                            {statusLabel}
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

      {/* Ticket Preview Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-transparent max-w-3xl w-full animate-float-up relative">
            <button
              onClick={() => setIsTicketModalOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-1 overflow-x-auto">
                <ETicket
                  ref={ticketRef}
                  trip={ticketToPrint}
                  passengerInfo={{
                    name: userData.fullName,
                    phone: userData.phoneNumber
                  }}
                />
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold border border-gray-200 hover:bg-gray-100 transition text-gray-700"
                >
                  Close Preview
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                >
                  Download / Print Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-float-up { animation: floatUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ProfilePage;