import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { trip, selectedSeats, totalPrice, booking } = location.state || {};

    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: PIN
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [popup, setPopup] = useState({ show: false, message: '' });

    const showPopup = (message) => {
        setPopup({ show: true, message });
        setTimeout(() => setPopup({ show: false, message: '' }), 3500);
    };

    useEffect(() => {
        let interval = null;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            // Redirect back when timer hits 0
            showPopup('Session expired. Please try again.');
            setStep(1);
            setTimer(60); // Reset timer for next attempt
            setOtp('');   // Clear OTP field
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    // Mock Validation logic stays same
    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (phoneNumber.length === 11) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setTimer(60);
                setStep(2);
            }, 1000);
        } else {
            showPopup('Invalid Phone Number. Please enter an 11-digit number.');
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        if (otp === '4848') {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setStep(3);
            }, 1000);
        } else {
            showPopup('Invalid OTP. Please try again.');
        }
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            navigate('/checkout', {
                state: { trip, selectedSeats, totalPrice, paymentSuccess: true, booking }
            });
        }, 2000);
    };

    if (!trip) return <div>Invalid Session</div>;

    return (
        <div className="min-h-screen bg-whitesmoke flex items-center justify-center p-4">
            {/* Toast Popup */}
            {popup.show && (
                <div
                    style={{ animation: 'slideIn 0.3s ease-out forwards' }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold bg-red-600 text-white"
                >
                    ⚠️ {popup.message}
                </div>
            )}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `}</style>
            <div className="bg-white rounded-[10px] w-full max-w-sm shadow-2xl overflow-hidden relative border border-gray-300">

                {/* bKash Header - Now White */}
                <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                            <img
                                src="https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg"
                                alt="bKash Logo"
                                className="w-10 h-10 object-contain"
                            />
                        </div>
                        <div className="text-gray-800">
                            <p className="text-xs font-semibold opacity-70">Merchant: {trip.bus_name || "TripSync"}</p>
                            <p className="font-bold text-[#E2136E]">৳ {totalPrice}</p>
                        </div>
                    </div>
                    <div className="font-bold italic text-xl">
                        <span className="text-[#E2136E]">b</span>
                        <span className="text-black">Kash</span>
                    </div>
                </div>

                {/* Content - Now bKash Pink */}
                <div className="bg-[#E2136E] p-8 py-12 relative min-h-[350px]">

                    {loading && (
                        <div className="absolute inset-0 bg-[#E2136E]/90 z-50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                            <div className="text-center text-white mb-6">
                                <p className="font-medium">Enter your bKash Account number</p>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g 017xxxxxxxx"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                className="w-full border-b-2 border-white/50 focus:border-white outline-none text-center text-xl py-2 bg-transparent text-white placeholder-white/30"
                                autoFocus
                            />
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 bg-black/20 text-white font-bold hover:bg-black/30 rounded uppercase text-sm">Close</button>
                                <button type="submit" className="flex-1 py-3 bg-white text-[#E2136E] font-bold rounded shadow-lg hover:bg-gray-100 uppercase text-sm">Confirm</button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div className="text-center text-white mb-6">
                                <p className="font-medium">Enter Verification Code sent to {phoneNumber}</p>
                                {/* Countdown Timer Display */}
                                <p className="text-xs mt-2 opacity-90 italic">
                                    Time remaining: <span className="font-bold">{timer}s</span>
                                </p>
                            </div>
                            <input
                                type="text"
                                placeholder="OTP: 1234"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className="w-full border-b-2 border-white/50 focus:border-white outline-none text-center text-xl py-2 bg-transparent text-white placeholder-white/30"
                                autoFocus
                            />
                            <div className="text-center">
                                <button
                                    type="button"
                                    disabled={timer > 0}
                                    className={`text-xs underline ${timer > 0 ? 'text-white/40 cursor-not-allowed' : 'text-white hover:text-gray-200'}`}
                                >
                                    Resend Code
                                </button>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setTimer(60); }}
                                    className="flex-1 py-3 bg-black/20 text-white font-bold hover:bg-black/30 rounded uppercase text-sm"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-white text-[#E2136E] font-bold rounded shadow-lg hover:bg-gray-100 uppercase text-sm"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handlePinSubmit} className="space-y-6">
                            <div className="text-center text-white mb-6">
                                <p className="font-medium">Enter PIN of your bKash Account</p>
                            </div>
                            <input
                                type="password"
                                placeholder="Enter PIN"
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                className="w-full border-b-2 border-white/50 focus:border-white outline-none text-center text-xl py-2 bg-transparent text-white placeholder-white/30 tracking-[0.5em]"
                                autoFocus
                            />
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 bg-black/20 text-white font-bold hover:bg-black/30 rounded uppercase text-sm">Back</button>
                                <button type="submit" className="flex-1 py-3 bg-white text-[#E2136E] font-bold rounded shadow-lg hover:bg-gray-100 uppercase text-sm">Confirm</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white p-3 text-center border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-medium">Calls to 16247 | Version: 1.2.0-beta</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;