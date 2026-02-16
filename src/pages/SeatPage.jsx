import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Info, ShieldCheck, Wifi, Coffee, Wind, MapPin, Clock, ArrowLeft } from "lucide-react";

export default function SeatPage() {
    const location = useLocation();
    const trip = location.state;
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
        if (loggedInUser) setUser(loggedInUser);
        window.scrollTo(0, 0);
    }, []);

    if (!trip) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Info size={32} className="text-gray-400" />
                </div>
                <h2 className="text-3xl font-black mb-4">No Trip Selected</h2>
                <p className="text-gray-500 font-medium mb-8 max-w-md">We couldn't find your trip details. Please go back to the search page.</p>
                <Link to="/" className="px-8 py-4 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                    <ArrowLeft size={20} /> Back to Search
                </Link>
            </div>
        );
    }

    const departureTime = trip.time;
    const seatPrice = trip.price;
    const cols = 4;
    const [totalSeats, setTotalSeats] = useState(trip.total_seats || 36);
    const rows = Math.ceil(totalSeats / cols);
    const seatLetters = ['A', 'B', 'C', 'D'];

    const [bookedSeats, setBookedSeats] = useState([]);
    const [isLoadingSeats, setIsLoadingSeats] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        const fetchAvailableSeats = async () => {
            setIsLoadingSeats(true);
            try {
                const response = await fetch("http://localhost:8000/tickets/seat-overlay", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ trip_details: trip })
                });
                if (response.ok) {
                    const data = await response.json();
                    setBookedSeats(data.booked_seats || []);
                    if (data.total_seats) setTotalSeats(data.total_seats);
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
            } finally {
                setIsLoadingSeats(false);
            }
        };
        fetchAvailableSeats();
    }, [trip.operator, trip.from, trip.to, trip.date, trip.time]);

    const allPossibleSeats = [];
    for (let r = 1; r <= rows; r++) {
        for (let c = 0; c < cols; c++) {
            allPossibleSeats.push(`${seatLetters[c]}${r}`);
        }
    }

    const seats = allPossibleSeats.map(seatNumber => {
        const cIndex = seatLetters.indexOf(seatNumber.charAt(0));
        return {
            number: seatNumber,
            type: (cIndex === 0 || cIndex === 3) ? "Window" : "Aisle",
            booked: bookedSeats.includes(seatNumber),
        };
    });

    const toggleSeat = (seat) => {
        if (selectedSeats.includes(seat.number)) {
            setSelectedSeats(selectedSeats.filter((s) => s !== seat.number));
        } else {
            if (selectedSeats.length < 4) {
                setSelectedSeats([...selectedSeats, seat.number]);
            } else {
                setMessage("Maximum 4 seats can be selected");
                setTimeout(() => setMessage(""), 3000);
            }
        }
    };

    const SeatComponent = ({ seat }) => {
        const isSelected = selectedSeats.includes(seat.number);
        const isBooked = seat.booked;

        return (
            <motion.div
                whileHover={!isBooked ? { scale: 1.1, y: -2 } : {}}
                whileTap={!isBooked ? { scale: 0.95 } : {}}
                onClick={() => !isBooked && toggleSeat(seat)}
                className={`relative w-14 h-16 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm
                    ${isSelected
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 ring-4 ring-blue-50'
                        : isBooked
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-none shadow-none'
                            : 'bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md'
                    }`}
            >
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black leading-none mb-1">{seat.number}</span>
                    <div className={`w-6 h-1 rounded-full ${isSelected ? 'bg-blue-400' : isBooked ? 'bg-gray-200' : 'bg-gray-100'}`}></div>
                </div>
                {seat.type === "Window" && !isBooked && !isSelected && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-100 rounded-full border border-white"></div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex flex-col font-inter">
            <Header />

            <main className="flex-grow pt-24 pb-16">
                {/* Progress Header */}
                <div className="max-w-7xl mx-auto px-6 mb-12">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
                        <span className="text-gray-900">Select Seats</span>
                        <ChevronRight size={14} />
                        <span>Checkout</span>
                        <ChevronRight size={14} />
                        <span>Payment</span>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 text-blue-600 font-black text-sm mb-3">
                                <span className="px-3 py-1 bg-blue-50 rounded-full uppercase tracking-tighter">{trip.type}</span>
                                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                <span>{trip.operator}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-4 flex-wrap">
                                {trip.from}
                                <ArrowLeft className="rotate-180 text-gray-300" size={32} />
                                {trip.to}
                            </h1>
                            <div className="flex gap-6 mt-6">
                                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                                    <Clock size={18} className="text-blue-500" /> {departureTime}
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                                    <Calendar size={18} className="text-blue-500" /> {trip.date || "Today"}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-6">
                            {[
                                { icon: <ShieldCheck size={20} />, label: "Verified" },
                                { icon: <Wifi size={20} />, label: "5G WiFi" },
                                { icon: <Wind size={20} />, label: "A/C" },
                                { icon: <Coffee size={20} />, label: "Snacks" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                                    <div className="text-blue-500">{item.icon}</div>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_400px] gap-12">
                    {/* Left: Seat Map */}
                    <div className="space-y-8">
                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-10 bg-white py-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg border-2 border-gray-100 bg-white"></div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Available</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 shadow-md shadow-blue-100"></div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">Selected</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100"></div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">Booked</span>
                            </div>
                        </div>

                        {/* Bus Layout Container */}
                        <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-xl shadow-gray-100/50 border border-gray-100 relative overflow-hidden">
                            {/* Dashboard/Driver Area */}
                            <div className="w-full h-24 bg-gray-50 rounded-t-[32px] mb-16 flex items-center justify-between px-10 border-b border-gray-100">
                                <div className="space-y-1">
                                    <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                                    <div className="w-8 h-1.5 bg-gray-200 rounded-full opacity-60"></div>
                                </div>
                                <div className="w-14 h-14 rounded-full border-4 border-gray-200 flex items-center justify-center opacity-40">
                                    <div className="w-8 h-8 rounded-full border-4 border-gray-200"></div>
                                </div>
                            </div>

                            {isLoadingSeats ? (
                                <div className="h-96 flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                    <p className="text-gray-400 font-black uppercase tracking-[4px] text-xs">Scanning seats</p>
                                </div>
                            ) : (
                                <div className="space-y-5 max-w-sm mx-auto">
                                    {Array.from({ length: rows }, (_, r) => (
                                        <div key={r} className="grid grid-cols-[1fr_1fr_40px_1fr_1fr] gap-4 items-center">
                                            {/* Left Pair */}
                                            {seats.slice(r * cols, r * cols + 2).map(seat => (
                                                <SeatComponent key={seat.number} seat={seat} />
                                            ))}

                                            {/* Aisle */}
                                            <div className="flex justify-center italic text-[10px] text-gray-200 font-bold rotate-90 whitespace-nowrap">
                                                AISLE
                                            </div>

                                            {/* Right Pair */}
                                            {seats.slice(r * cols + 2, r * cols + 4).map(seat => (
                                                <SeatComponent key={seat.number} seat={seat} />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs shadow-xl shadow-red-200 z-20"
                                >
                                    {message}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="sticky top-28 h-fit">
                        <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -z-10 opacity-60"></div>

                            <h2 className="text-2xl font-black tracking-tight mb-8">Booking Summary</h2>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Route Info</span>
                                    <span className="font-bold text-gray-900">{trip.from} to {trip.to}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Ticket Price</span>
                                    <span className="font-bold text-gray-900">৳{seatPrice} / seat</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Selected Seats</span>
                                    <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                        {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-6 border-t-2 border-dashed border-gray-100 mb-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Grand Total</p>
                                        <p className="text-4xl font-black tracking-tighter text-gray-900">
                                            ৳{selectedSeats.length * seatPrice}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">+ Tax & Service</p>
                                        <p className="text-gray-400 font-bold text-[10px]">All inclusive</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate("/checkout", { state: { trip: trip, selectedSeats, totalPrice: selectedSeats.length * seatPrice } })}
                                disabled={selectedSeats.length === 0}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3
                                    ${selectedSeats.length > 0
                                        ? 'bg-black text-white hover:bg-gray-800 shadow-black/10'
                                        : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                Continue to Checkout
                                <ArrowLeft className="rotate-180" size={20} />
                            </button>

                            <div className="mt-8 flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                    <ShieldCheck size={20} />
                                </div>
                                <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                                    Your personal data is protected and your tickets are insured for this trip.
                                </p>
                            </div>
                        </div>

                        {/* Recent Reviews / Small Social Proof */}
                        <div className="mt-10 px-8">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">12 others booking now</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
