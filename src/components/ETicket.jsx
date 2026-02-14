import React, { forwardRef } from "react";
import QRCode from "react-qr-code";

const ETicket = forwardRef(({ trip, passengerInfo }, ref) => {
    if (!trip) return null;

    // Ensure seats is a string for display
    const seatDisplay = Array.isArray(trip.seats) ? trip.seats.sort().join(', ') : trip.seats;

    return (
        <div ref={ref} className="p-8 bg-white text-black font-sans border border-gray-200 w-full max-w-[700px] mx-auto shadow-lg print:shadow-none print:border-none print:p-0">
            {/* Ticket Header */}
            <div className="flex justify-between items-center border-b-2 border-blue-900 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-blue-900 leading-none">TripSync</h1>
                    <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mt-1">Electronic Boarding Pass</p>
                </div>
                <div className="text-right">
                    <p className="font-mono font-bold text-sm text-gray-400">TKT-ID</p>
                    <p className="font-mono font-bold text-lg uppercase leading-none">{String(trip.id).slice(-8).toUpperCase()}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Passenger Name</label>
                            <p className="text-lg font-bold text-gray-900">{passengerInfo?.name || "Passenger"}</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Contact Number</label>
                            <p className="text-lg font-bold text-gray-900">{passengerInfo?.phone || "N/A"}</p>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-2xl flex justify-between items-center border border-blue-100">
                        <div className="flex-1">
                            <label className="text-[10px] text-blue-400 uppercase font-bold tracking-wider block mb-1">From</label>
                            <p className="text-xl font-black text-blue-900">{trip.origin}</p>
                        </div>
                        <div className="px-4 text-blue-200 text-2xl">➜</div>
                        <div className="flex-1 text-right">
                            <label className="text-[10px] text-blue-400 uppercase font-bold tracking-wider block mb-1">To</label>
                            <p className="text-xl font-black text-blue-900">{trip.destination}</p>
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                        <QRCode
                            value={`TICKET|${trip.id}|${passengerInfo?.phone || 'GUEST'}`}
                            size={120}
                            level="H"
                        />
                    </div>
                    <p className="text-[10px] mt-3 text-gray-400 font-bold tracking-widest uppercase">Scan to Verify</p>
                </div>
            </div>

            {/* Ticket Details Grid */}
            <div className="border-t border-dashed border-gray-300 pt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Date</label>
                    <p className="font-bold text-gray-900">{trip.date}</p>
                </div>
                <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Departure</label>
                    <p className="font-bold text-gray-900">{trip.time}</p>
                </div>
                <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Coach / Seat</label>
                    <p className="font-bold text-red-600 truncate">{trip.bus_name} / {seatDisplay}</p>
                </div>
                <div className="text-right">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Grand Total</label>
                    <p className="text-2xl font-black text-gray-900">৳{trip.price}</p>
                </div>
            </div>

            {/* Anti-fraud Footer */}
            <div className="mt-8 pt-4 border-t border-gray-100 text-[9px] text-gray-400 uppercase tracking-widest flex justify-between">
                <span>Issued by TripSync Systems</span>
                <span>Valid for boarding with ID proof</span>
            </div>
        </div>
    );
});

export default ETicket;
