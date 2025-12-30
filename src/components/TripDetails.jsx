import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const TripDetails = ({trip}) => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="bg-white rounded-3xl shadow-md p-8 flex flex-col md:flex-row justify-between items-center hover:shadow-xl transition">
                <div className="grid md:grid-cols-6 gap-6 w-full">
                    <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="text-lg font-semibold">{trip.from}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">To</p>
                        <p className="text-lg font-semibold">{trip.to}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Departure</p>
                        <p className="text-lg font-semibold">{trip.time}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Seats</p>
                        <p className="text-lg font-semibold">{trip.seats} available</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Bus Type</p>
                        <p className="text-lg font-semibold">{trip.type}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-lg font-semibold">{trip.date}</p>
                    </div>
                </div>

                <div className="mt-6 md:mt-0 flex items-center gap-6">
                    <p className="text-2xl font-bold">৳{trip.price}</p>
                    {/* <Link to={"/seats"} className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition">
                        View Seats
                    </Link> */}
                    <button
  onClick={() => navigate("/seats", { state: trip })}
  className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
>
  View Seats
</button>
                </div>
            </div>
        </div>
    )
}

export default TripDetails