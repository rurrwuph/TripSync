import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import bookedSeatsData from "../assets/bookedSeats.json"

export default function SeatPage() {

    const location = useLocation();
    const trip = location.state;
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const bookedSeatsFromJson = bookedSeatsData[trip.id] || [];
    const bookedSeatsFromStorage = JSON.parse(localStorage.getItem(`bookedSeats_trip_${trip.id}`)) || [];
    const bookedSeatsForTrip = Array.from(new Set([...bookedSeatsFromJson, ...bookedSeatsFromStorage]));

    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
        if (loggedInUser) setUser(loggedInUser);
    }, []);

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                No trip selected. Please go back and select a trip.
            </div>
        );
    }

    const departureTime = trip.time;
    const seatPrice = trip.price;
    const rows = 8;
    const cols = 4;
    const seatLetters = ['A', 'B', 'C', 'D'];

    const seats = [];
    for (let r = 1; r <= rows; r++) {
        for (let c = 0; c < cols; c++) {
            const seatNumber = `${seatLetters[c]}${r}`;

            seats.push({
                number: seatNumber,
                type: (c === 0 || c === 4) ? "Window" : "Aisle",
                booked: bookedSeatsForTrip.includes(seatNumber),
            });
        }
    }

    const [selectedSeats, setSelectedSeats] = useState([]);

    const toggleSeat = (seat) => {
        if (selectedSeats.includes(seat.number)) {
            setSelectedSeats(selectedSeats.filter((s) => s !== seat.number));
        } else {
            if (selectedSeats.length < 4) {
                setSelectedSeats([...selectedSeats, seat.number]);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            {/* Header / Breadcrumb */}
            <header className="bg-white border-b border-gray-200 py-5 shadow">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">TripSync</h1>
                    <div className="flex gap-4">
                        <Link to={"/"} className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition">Home</Link>

                        {!user ? (
                            <>
                                <Link to="/login" className="px-6 py-2 rounded-full border border-gray-300 hover:border-black transition">Login</Link>
                                <Link to="/register" className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition">Register</Link>
                            </>
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
                                        <button onClick={() => { navigate("/profile"); setMenuOpen(false); }} className="px-4 py-2 hover:bg-gray-100 text-left">View Profile</button>
                                        <button onClick={handleSwitchAccount} className="px-4 py-2 hover:bg-gray-100 text-left">Switch Account</button>
                                        <button onClick={handleLogout} className="px-4 py-2 hover:bg-gray-100 text-left text-red-500">Log Out</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* <div className="max-w-7xl mx-auto px-6 mt-3 text-gray-600">
                    Search &rarr; View Seats
                </div> */}
            </header>

            {/* Bus Info */}
            <section className="max-w-6xl mx-auto px-6 py-6 bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all mt-6">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-transparent bg-clip-text">
                    {trip.from} &rarr; {trip.to}</h2>
                <p className="text-gray-600">Bus Type: {trip.type} | Departure: {departureTime} | Price per seat: ৳{seatPrice}</p>
            </section>

            {/* Seat Legend */}
            <section className="max-w-6xl mx-auto px-6 mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                    <span className="text-gray-600 font-medium">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    <span className="text-gray-600">Booked</span>
                </div>
            </section>

            <div className="flex flex-grow mt-6 max-w-7xl mx-auto gap-8 px-6">
                {message && (
                    <p className="text-center text-red-500 font-medium mb-4">
                        {message}
                    </p>
                )}
                {/* Seat Layout */}
                <div className="flex-grow grid grid-rows-8 gap-y-3">
                    {Array.from({ length: rows }, (_, r) => (
                        <div key={r} className="flex justify-between gap-2">
                            {/* First two seats */}
                            {seats.slice(r * cols, r * cols + 2).map(seat => (
                                <div
                                    key={seat.number}
                                    className={`w-14 h-14 flex items-center justify-center rounded-lg cursor-pointer transition transform hover:scale-105
                    ${selectedSeats.includes(seat.number) ? 'bg-green-500 text-white' : seat.booked ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-white hover:bg-gray-200'}`}
                                    onClick={() => !seat.booked && toggleSeat(seat)}
                                >
                                    {seat.number}
                                </div>
                            ))}

                            {/* Walking area gap */}
                            <div className="w-4"></div>

                            {/* Last two seats */}
                            {seats.slice(r * cols + 2, r * cols + 4).map(seat => (
                                <div
                                    key={seat.number}
                                    className={`w-14 h-14 flex items-center justify-center rounded-lg cursor-pointer transition transform hover:scale-105
                    ${selectedSeats.includes(seat.number) ? 'bg-green-500 text-white' : seat.booked ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-white hover:bg-gray-200'}`}
                                    onClick={() => {
                                        if (seat.booked) {

                                            setMessage(`Seat ${seat.number} is already booked`);

                                            setTimeout(() => {
                                                setMessage("");
                                            }, 2000);

                                            return;
                                        }
                                        toggleSeat(seat);
                                    }}
                                >
                                    {seat.number}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Sidebar */}
                <div className={`w-96 bg-white shadow-2xl p-6 transition-all ${selectedSeats.length > 0 ? '' : 'opacity-50 pointer-events-none'}`}>
                    <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-transparent bg-clip-text">
                        Booking Summary</h2>
                    <p className="mb-2">Departure: {departureTime}</p>
                    <p className="mb-2 font-medium">Selected Seats: {selectedSeats.join(', ') || 'None'}</p>
                    <p className="mb-2">Seat Type: {selectedSeats.length > 0 ? 'Window / Middle' : '-'}</p>
                    <p className="mb-4 font-semibold text-lg">Total Price: ৳{selectedSeats.length * seatPrice}</p>
                    <button className={`w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition ${selectedSeats.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={selectedSeats.length === 0}
                        onClick={() => navigate("/checkout", { state: { trip: trip, selectedSeats, totalPrice: selectedSeats.length * seatPrice } })}>
                        Checkout
                    </button>
                    <div className="mt-6 text-gray-500 text-sm">
                        Estimated Travel Time: 6h | WiFi | {trip.type} | Restroom
                    </div>
                </div>
            </div>
            <Footer></Footer>
        </div>
    );
}
