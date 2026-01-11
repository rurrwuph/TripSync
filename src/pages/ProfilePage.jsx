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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      const loggedInUser = localStorage.getItem('currentUser');
      if (loggedInUser) {
        try {
          const user = JSON.parse(loggedInUser);
          setUserData({
            fullName: user.fullname || 'TripSync User',
            email: user.email,
            phoneNumber: user.phone || 'Not provided',
            accountType: user.role === 'admin' ? 'Administrator Account' : 'Passenger Account',
          });

          // Fetch tickets from API
          try {
            const response = await fetch(`http://localhost:8000/tickets/user/${user.email}`);
            if (response.ok) {
              const data = await response.json();

              // Transform API data to match frontend structure
              // API returns: { id, trip: { route, departure_time, ... }, seat_number, ... }
              // Frontend expects: { id, from, to, date, time, seats: [], totalPrice, bookedAt }

              // Grouping seats by trip is tricky if we just get a flat list of tickets.
              // For now, let's map each ticket or try to simple grouping if needed.
              // Simplification: Display each ticket individually or simple format.
              // But wait, the previous code showed "Seats: A1, A2". 
              // To achieve that, we'd need to group by Trip ID on the frontend.

              const formattedBookings = data.map(ticket => {
                const trip = ticket.trip || {};
                const dateObj = new Date(trip.departure_time);
                const [fromCity, toCity] = (trip.route || "Unknown - Unknown").split("-").map(s => s.trim());

                return {
                  id: ticket.id,
                  from: fromCity || "Unknown",
                  to: toCity || "Unknown",
                  date: dateObj.toLocaleDateString(),
                  time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  seats: [ticket.seat_number], // Individual ticket
                  totalPrice: trip.base_fare, // Per seat price
                  bookedAt: dateObj.toISOString() // accurate enough for display
                };
              });
              setBookings(formattedBookings);
            } else {
              console.error("Failed to fetch tickets");
            }
          } catch (err) {
            console.error("Error fetching tickets:", err);
          }

        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      } else {
        navigate('/login');
      }
    };
    fetchProfileData();
  }, [navigate]);

  const getAvatarInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-grow py-12 px-6">
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
                  <p className="text-sm font-medium truncate" title={userData.email}>{userData.email}</p>
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
                <div className="text-6xl mb-4">🎫</div>
                <h4 className="text-xl font-bold mb-2">No trips found</h4>
                <p className="text-gray-500 mb-6">You haven't booked any bus tickets yet.</p>
                <button onClick={() => navigate('/explore')} className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                  Book a Trip
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-6">
                    {/* Route Info */}
                    <div className="flex-grow">
                      <div className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">
                        {new Date(booking.bookedAt).toLocaleDateString()}
                      </div>
                      <h4 className="text-xl font-bold mb-1">
                        {booking.from} <span className="text-gray-300 mx-2">&rarr;</span> {booking.to}
                      </h4>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center gap-1">
                          📅 {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏰ {booking.time}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="flex flex-col md:items-end justify-center min-w-[140px]">
                      <div className="text-2xl font-bold">৳{booking.totalPrice}</div>
                      <div className="text-sm text-gray-500 mb-2">
                        Seats: <span className="font-semibold text-black">{booking.seats.join(', ')}</span>
                      </div>
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                        CONFIRMED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;