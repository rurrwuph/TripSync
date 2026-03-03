import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTrips } from "../context/TripContext";
import { formatTime, formatDate, API_BASE_URL } from "../services/tripService";

const RobotIcon = ({ size = 28, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Antenna */}
        <line x1="32" y1="4" x2="32" y2="14" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="4" r="3" fill="#00e5ff">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Head */}
        <rect x="12" y="14" width="40" height="30" rx="8" fill="#1a1a2e" stroke="#00e5ff" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="24" cy="28" r="5" fill="#00e5ff">
            <animate attributeName="r" values="5;4;5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="28" r="5" fill="#00e5ff">
            <animate attributeName="r" values="5;4;5" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Mouth - circuit pattern */}
        <path d="M22 38 L28 38 L30 36 L34 36 L36 38 L42 38" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Body circuit lines */}
        <rect x="18" y="46" width="28" height="14" rx="4" fill="#1a1a2e" stroke="#0d47a1" strokeWidth="1.5" />
        <line x1="25" y1="50" x2="25" y2="56" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
        <line x1="32" y1="49" x2="32" y2="57" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
        <line x1="39" y1="50" x2="39" y2="56" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
        <circle cx="25" cy="53" r="1.5" fill="#00e5ff" opacity="0.8" />
        <circle cx="32" cy="53" r="1.5" fill="#00e5ff" opacity="0.8" />
        <circle cx="39" cy="53" r="1.5" fill="#00e5ff" opacity="0.8" />
    </svg>
);

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
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.text }),
            });

            const data = await response.json();
            setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);

            if (data.action === "navigate_search") {
                const { origin, destination, date } = data.params;
                navigate(`/explore?from=${origin}&to=${destination}&date=${date}`);
            }

            if (data.action?.startsWith("navigate:")) {
                navigate(data.action.split(":")[1]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "⚠️ Unable to connect to the assistant. Please ensure the backend is running." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">

            {/* Floating Robot Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d1b4a 100%)',
                    boxShadow: isOpen
                        ? '0 0 30px rgba(0, 229, 255, 0.5), 0 0 60px rgba(0, 229, 255, 0.2)'
                        : '0 0 20px rgba(0, 229, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)'
                }}
            >
                {isOpen ? (
                    <span className="text-cyan-400 text-2xl font-bold">✕</span>
                ) : (
                    <RobotIcon size={32} />
                )}
                {/* Pulsing ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-30" />
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute bottom-20 right-0 w-[380px] h-[540px] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    style={{
                        background: 'linear-gradient(180deg, #0a0a1a 0%, #111827 100%)',
                        border: '1px solid rgba(0, 229, 255, 0.2)',
                        boxShadow: '0 0 40px rgba(0, 229, 255, 0.15), 0 20px 60px rgba(0, 0, 0, 0.5)'
                    }}
                >

                    {/* Header */}
                    <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.15)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d47a1, #1565c0)' }}>
                            <RobotIcon size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-white tracking-wide">TripSync AI</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <p className="text-[11px] text-cyan-400 font-medium">Online • Neural Engine v3</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 opacity-60 animate-pulse" style={{ animationDelay: '0s' }} />
                            <div className="w-2 h-2 rounded-full bg-cyan-400 opacity-40 animate-pulse" style={{ animationDelay: '0.3s' }} />
                            <div className="w-2 h-2 rounded-full bg-cyan-400 opacity-20 animate-pulse" style={{ animationDelay: '0.6s' }} />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.sender === "bot" && (
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0" style={{ background: 'rgba(0, 229, 255, 0.1)' }}>
                                        <RobotIcon size={14} />
                                    </div>
                                )}

                                {msg.text && (
                                    <div
                                        className={`px-4 py-2.5 max-w-[75%] text-sm rounded-2xl shadow-lg ${msg.sender === "user"
                                            ? "rounded-br-md text-white"
                                            : "rounded-bl-md text-gray-200"
                                            }`}
                                        style={{
                                            background: msg.sender === "user"
                                                ? 'linear-gradient(135deg, #0d47a1, #1565c0)'
                                                : 'rgba(255, 255, 255, 0.07)',
                                            border: msg.sender === "user"
                                                ? 'none'
                                                : '1px solid rgba(0, 229, 255, 0.1)'
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                )}

                                {msg.type === "trips" && (
                                    <div className="w-full space-y-3">
                                        {msg.trips.slice(0, 4).map((trip, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-2xl p-4 shadow-sm"
                                                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.1)' }}
                                            >
                                                <div className="font-semibold text-sm mb-1 text-white">
                                                    {trip.from} - {trip.to}
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                    <span>{trip.operator}</span>
                                                    <span className="font-semibold text-cyan-400">
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
                            <div className="flex items-center gap-2 text-xs text-cyan-400">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0s' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                                </div>
                                Processing neural response...
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSendMessage}
                        className="flex gap-2 px-4 py-3"
                        style={{ background: 'rgba(0, 0, 0, 0.3)', borderTop: '1px solid rgba(0, 229, 255, 0.1)' }}
                    >
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                            placeholder="Ask the AI something..."
                            style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(0, 229, 255, 0.15)',
                            }}
                        />
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-lg active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #00b8d4, #0091ea)',
                                color: 'white',
                                boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)'
                            }}
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
