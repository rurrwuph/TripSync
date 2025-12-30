import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTrips } from "../context/TripContext";
import { formatTime, formatDate } from "../services/tripService";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "bot", text: 'Hi! I can help you navigate TripSync. Try "Go to explore".' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const { setSearchResults, setIsSearchActive } = useTrips();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.text }),
            });

            const data = await response.json();
            setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);

            if (data.action?.startsWith("navigate:")) {
                navigate(data.action.split(":")[1]);
            }

            if (data.data?.trips) {
                // Map trips to frontend format
                const mappedTrips = data.data.trips.map(trip => ({
                    id: trip.trip_id,
                    from: data.params?.origin || trip.origin_city_name,
                    to: data.params?.destination || trip.destination_city_name,
                    time: formatTime(trip.departure_time),
                    date: formatDate(data.params?.date),
                    price: trip.price,
                    seats: trip.seats_available,
                    operator: trip.operator,
                    type: trip.type
                }));

                // Update global context to show in TripPage
                setSearchResults(mappedTrips);
                setIsSearchActive(true);

                // Show in chat bubble
                setMessages((prev) => [
                    ...prev,
                    { sender: "bot", type: "trips", trips: mappedTrips } // Use mapped trips for consistent display
                ]);

                // Navigate to results page automatically
                navigate("/explore");
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Unable to connect right now." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-black text-white text-xl shadow-xl hover:scale-105 transition"
            >
                {isOpen ? "✕" : "💬"}
            </button>

            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[360px] h-[520px] bg-white rounded-3xl shadow-xl flex flex-col">

                    {/* Header */}
                    <div className="px-6 py-4 border-b text-center">
                        <h3 className="text-lg font-semibold">TripSync Assistant</h3>
                        <p className="text-xs text-gray-500">
                            Smart help for your journey
                        </p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.text && (
                                    <div
                                        className={`px-4 py-2 max-w-[75%] text-sm rounded-2xl shadow
                      ${msg.sender === "user"
                                                ? "bg-black text-white rounded-br-md"
                                                : "bg-white text-gray-800 rounded-bl-md border"}
                    `}
                                    >
                                        {msg.text}
                                    </div>
                                )}

                                {msg.type === "trips" && (
                                    <div className="w-full space-y-3">
                                        {msg.trips.slice(0, 4).map((trip, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white border rounded-2xl p-4 shadow-sm"
                                            >
                                                <div className="font-semibold text-sm mb-1">
                                                    {trip.from} - {trip.to}
                                                </div>

                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>{trip.operator}</span>
                                                    <span className="font-semibold text-black">
                                                        ৳{trip.price}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    {trip.departure_time} • {trip.type}
                                                </div>
                                            </div>
                                        ))}

                                        {msg.trips.length > 4 && (
                                            <div className="text-center text-xs text-gray-500">
                                                +{msg.trips.length - 4} more trips available
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="text-xs text-gray-500">Assistant is typing...</div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSendMessage}
                        className="flex gap-2 px-4 py-3 border-t bg-white rounded-b-3xl"
                    >
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-black"
                            placeholder="Ask something..."
                        />
                        <button
                            type="submit"
                            className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
