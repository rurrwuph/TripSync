import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useReactToPrint } from "react-to-print";
import ETicket from "../components/ETicket";
import { apiRequest } from "../services/api";

const PendingTimer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        if (onExpire) {
          // Use a small delay to avoid race conditions with backend
          setTimeout(() => onExpire(), 500);
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (timeLeft <= 0) return <span className="text-red-600 font-bold text-xs uppercase">Expired</span>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-1 text-green-600 font-mono text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
      <span className="animate-pulse">●</span>
      Pay in {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

const initialUserData = {
  fullName: 'Loading...',
  email: 'loading@tripsync.com',
  phoneNumber: 'N/A',
  accountType: 'Pending',
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(initialUserData);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeatsForCancel, setSelectedSeatsForCancel] = useState([]);
  const [cancelCause, setCancelCause] = useState('Change of plans');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: 'success', message: '' });

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reward points state
  const [rewardPoints, setRewardPoints] = useState(0);

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3500);
  };
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
          fullName: user.full_name || 'TripSync User',
          email: user.email,
          phoneNumber: user.phone || 'Not provided',
          accountType: user.role === 'admin' ? 'Administrator Account' : 'Passenger Account',
        });

        // Fetch fresh user profile (reward points, etc.)
        const profileRes = await apiRequest('/users/me');
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setRewardPoints(profile.reward_points || 0);
          setUserData(prev => ({
            ...prev,
            fullName: profile.full_name || prev.fullName,
            phoneNumber: profile.phone || prev.phoneNumber,
          }));
        }

        const response = await apiRequest(`/tickets/user/${user.email}`);
        if (response.ok) {
          const data = await response.json(); // Now returns list of Bookings

          const processedBookings = data.map(booking => {
            const trip = booking.trip || {};
            const dateObj = new Date(trip.departure_time);
            const [fromCity, toCity] = (trip.route || "Unknown - Unknown").split("-").map(s => s.trim());

            return {
              id: booking.id,
              status: booking.status,
              from: fromCity,
              to: toCity,
              date: dateObj.toLocaleDateString(),
              time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              totalPrice: booking.total_price,
              bookedAt: booking.created_at,
              departureTime: trip.departure_time,
              bus_name: (trip.bus?.bus_number || "TripSync Bus").split(" - ")[0],
              seats: booking.tickets.map(t => t.seat_number),
              expiresAt: booking.expires_at,
              isExpired: booking.status === 'PENDING_PAYMENT' && new Date(booking.expires_at) < new Date(),
              tickets: booking.tickets.map(t => ({
                id: t.id,
                seat: t.seat_number,
                status: t.status,
                refund_status: t.refund_status,
                expires_at: booking.expires_at,
                payment_timestamp: booking.payment_timestamp
              }))
            };
          });

          setBookings(processedBookings);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await apiRequest('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ full_name: editName, phone: editPhone })
      });
      if (res.ok) {
        const updated = await res.json();
        // Persist fresh data to localStorage
        const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const merged = { ...stored, full_name: updated.full_name, phone: updated.phone };
        localStorage.setItem('currentUser', JSON.stringify(merged));
        setUserData(prev => ({
          ...prev,
          fullName: updated.full_name || prev.fullName,
          phoneNumber: updated.phone || prev.phoneNumber,
        }));
        setIsEditing(false);
        showPopup('success', 'Profile updated successfully!');
      } else {
        const err = await res.json();
        showPopup('error', err.detail || 'Failed to update profile.');
      }
    } catch (e) {
      showPopup('error', 'Network error. Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setSelectedSeatsForCancel([]); // Reset selection
    setIsModalOpen(true);
  };

  const toggleSeatSelection = (ticketId) => {
    setSelectedSeatsForCancel(prev =>
      prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]
    );
  };

  const submitCancellation = async () => {
    if (!selectedBooking || selectedSeatsForCancel.length === 0) {
      showPopup('error', 'Please select at least one seat to cancel.');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await apiRequest('/refunds/partial', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          ticket_ids: selectedSeatsForCancel,
          cause: cancelCause
        })
      });

      if (response.ok) {
        const refundData = await response.json();
        showPopup('success', `Cancellation processed! Refund: ৳${refundData.amount} (${refundData.status})`);
        setIsModalOpen(false);
        setSelectedBooking(null);
        // Refresh after short delay to let popup show
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const error = await response.json();
        showPopup('error', `Failed to cancel: ${error.detail}`);
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      showPopup('error', 'Network error during cancellation.');
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
      seats: booking.tickets.filter(t => t.status === 'BOOKED' || t.status === 'HELD').map(t => t.seat),
      date_of_issue: booking.tickets[0]?.payment_timestamp || booking.bookedAt
    };

    setTicketToPrint(ticketData);
    setIsTicketModalOpen(true);
  };

  const getAvatarInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';
  const isFutureTrip = (bookedAt) => new Date(bookedAt) > new Date();

  const getBookingStatus = (booking) => {
    return booking.status;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Header />

      <main className="flex-grow py-12 px-6">
        {/* Popup Toast */}
        {popup.show && (
          <div className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold ${popup.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`} style={{ animation: 'slideIn 0.3s ease-out forwards' }}>
            {popup.type === 'success' ? '✓' : '✕'} {popup.message}
          </div>
        )}

        {/* Cancellation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-float-up">
              <h3 className="text-2xl font-bold mb-4">Partial Cancellation</h3>

              <div className="bg-red-50 p-4 rounded-2xl mb-6 border border-red-100">
                <h4 className="text-red-800 font-bold text-sm mb-2 uppercase tracking-wider">Refund Policy</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• &gt; 48h before departure: 90% Refund</li>
                  <li>• 24-48h before departure: 75% Refund</li>
                  <li>• 12-24h before departure: 50% Refund</li>
                  <li>• &lt; 12h before departure: No Refund (0%)</li>
                  <li>• &lt; 6h before departure: Cancellation strictly rejected</li>
                </ul>
              </div>

              <p className="text-gray-600 mb-4">Select seats to cancel:</p>

              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                {selectedBooking.tickets.filter(t => t.status === 'BOOKED').map(t => (
                  <label key={t.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-red-600"
                      checked={selectedSeatsForCancel.includes(t.id)}
                      onChange={() => toggleSeatSelection(t.id)}
                    />
                    <span className="font-bold">Seat {t.seat}</span>
                  </label>
                ))}
                {selectedBooking.tickets.filter(t => t.status === 'BOOKED').length === 0 && (
                  <p className="text-sm text-center text-gray-400 py-4">No seats available for cancellation.</p>
                )}
              </div>

              <p className="text-gray-600 mb-2 text-sm">Reason for cancellation:</p>
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
                  disabled={isSubmitting || selectedSeatsForCancel.length === 0}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center border border-gray-100">
              <div className="w-24 h-24 mx-auto rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold mb-4">
                {getAvatarInitial(userData.fullName)}
              </div>

              {!isEditing ? (
                <>
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
                  <button
                    onClick={() => { setIsEditing(true); setEditName(userData.fullName === 'Loading...' ? '' : userData.fullName); setEditPhone(userData.phoneNumber === 'Not provided' ? '' : userData.phoneNumber); }}
                    className="mt-6 w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition text-sm"
                  >
                    ✏️ Edit Profile
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-xs text-gray-400 font-semibold uppercase block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-semibold uppercase block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-semibold uppercase block mb-1">Email</label>
                      <input
                        type="email"
                        value={userData.email}
                        disabled
                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Reward Points Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-80">Reward Points</h3>
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-3xl font-black mb-1">{rewardPoints.toLocaleString()}</p>
              <p className="text-xs opacity-70 mb-4">1,000 pts earned per seat booked</p>

              {/* Progress bar to 10,000 */}
              <div className="bg-white/20 rounded-full h-2.5 mb-2 overflow-hidden">
                <div
                  className="bg-white rounded-full h-2.5 transition-all duration-500"
                  style={{ width: `${Math.min(100, (rewardPoints / 10000) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs opacity-70">
                <span>{rewardPoints.toLocaleString()} / 10,000</span>
                <span>{rewardPoints >= 10000 ? '✅ Eligible!' : `${(10000 - rewardPoints).toLocaleString()} to go`}</span>
              </div>

              {rewardPoints >= 10000 && (
                <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-xs font-bold">🎉 You qualify for a 2% discount!</p>
                  <p className="text-xs opacity-70 mt-1">Apply it on your next booking checkout.</p>
                </div>
              )}
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
                  const isFuture = new Date(booking.departureTime) > new Date();
                  const canCancel = isFuture && (statusLabel === 'CONFIRMED' || statusLabel === 'PARTIALLY_CANCELLED');

                  let badgeColor = 'bg-green-50 text-green-700 border-green-100';
                  if (statusLabel === 'PENDING_PAYMENT') badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-100';
                  if (statusLabel === 'CANCELLED') badgeColor = 'bg-red-50 text-red-700 border-red-100';
                  if (statusLabel === 'PARTIALLY_CANCELLED') badgeColor = 'bg-blue-50 text-blue-700 border-blue-100';

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
                        <div className="text-sm text-gray-500 mb-1">
                          Active: <span className="font-semibold text-black">{booking.tickets.filter(t => t.status === 'BOOKED' || t.status === 'HELD').map(t => t.seat).sort().join(', ') || 'None'}</span>
                          {booking.tickets.some(t => t.status === 'RELEASED') && (
                            <span className="ml-2 text-red-400 line-through">{booking.tickets.filter(t => t.status === 'RELEASED').map(t => t.seat).sort().join(', ')}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {statusLabel === 'PENDING_PAYMENT' && !booking.isExpired && (
                            <PendingTimer
                              expiresAt={booking.expiresAt}
                              onExpire={() => {
                                // Only reload if we are still seeing PENDING_PAYMENT
                                if (booking.status === 'PENDING_PAYMENT') {
                                  window.location.reload();
                                }
                              }}
                            />
                          )}
                          {(statusLabel === 'CONFIRMED' || statusLabel === 'PARTIALLY_CANCELLED') && (
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
                          {statusLabel === 'PENDING_PAYMENT' && !booking.isExpired && (
                            <button
                              onClick={() => navigate('/checkout', { state: { booking } })}
                              className="px-4 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition"
                            >
                              Pay Now
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
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;