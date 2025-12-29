import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import bookedSeatsData from "../assets/bookedSeats.json"

const CheckoutPage = () => {
    
    const location = useLocation();
    const navigate = useNavigate();
    const { trip, selectedSeats, totalPrice } = location.state || {};
    // const [bookedSeats, setBookedSeats] = useState(bookedSeatsData[trip.id] || []);
    const [successMessage, setSuccessMessage] = useState("");

    
    if(!trip || !selectedSeats) {
        return (
      <div className="min-h-screen flex flex-col">
        <Header />
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

    const handleConfirmBooking = () => {
        
        const updatedSeats = [...bookedSeats, ...selectedSeats];
        setBookedSeats(updatedSeats);

        localStorage.setItem(`bookedSeats_trip_${trip.id}`, JSON.stringify(updatedSeats));

        setSuccessMessage(`Booking successful! Seats booked: ${selectedSeats.join(', ')}`);
        setTimeout(() => setSuccessMessage(""), 3000);
    }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 py-5 shadow">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">TripSync</h1>
                    <div className="flex gap-4">
                        <Link to={"/"} className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition">Home</Link>
                        <Link to={"/login"} className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition">Login</Link>
                        <Link to={"/register"} className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition">Register</Link>
                    </div>
                </div>
                {/* <div className="max-w-7xl mx-auto px-6 mt-3 text-gray-600">
                    Search &rarr; View Seats
                </div> */}
            </header>

         <main className="flex-grow max-w-4xl mx-auto px-6 py-12">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-transparent bg-clip-text">
                Checkout</h2>
         
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
            <button
              onClick={handleConfirmBooking}
              className="flex-1 py-3 md:px-8 bg-gray-200 text-black rounded-xl hover:scale-105 transform transition-all shadow-lg"
            >
              Confirm Booking
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 md:px-8 bg-black text-white rounded-xl hover:scale-105 transform transition-all shadow-lg"
            >
              Back
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default CheckoutPage
