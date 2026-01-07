import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { trip, selectedSeats, totalPrice } = location.state || {};

    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: PIN
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock Validation
    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (phoneNumber.length === 11) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setStep(2);
            }, 1000);
        } else {
            alert("Invalid Phone Number");
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        if (otp === '1234') { // Mock OTP
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setStep(3);
            }, 1000);
        } else {
            alert("Invalid OTP (Try 1234)");
        }
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            // Success! return to checkout with success flag
            navigate('/checkout', {
                state: {
                    trip,
                    selectedSeats,
                    totalPrice,
                    paymentSuccess: true
                }
            });
        }, 2000);
    };

    if (!trip) return <div>Invalid Session</div>;

    return (
        <div className="min-h-screen bg-[#E2136E] flex items-center justify-center p-4">
            <div className="bg-white rounded w-full max-w-sm shadow-2xl overflow-hidden relative">
                {/* bKash Header */}
                <div className="bg-[#E2136E] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                            {/* bKash Logo Placeholder - using text for simplicity or an external image if allowed */}
                            <span className="text-[#E2136E] font-bold text-xs">bKash</span>
                        </div>
                        <div className="text-white">
                            <p className="text-xs opacity-80">Merchant: TripSync</p>
                            <p className="font-bold">৳ {totalPrice}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 py-12 relative min-h-[300px]">

                    {loading && (
                        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E2136E]"></div>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                            <div className="text-center text-gray-600 mb-6">
                                <p>Enter your bKash Account number</p>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g 017xxxxxxxx"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                className="w-full border-b-2 border-gray-300 focus:border-[#E2136E] outline-none text-center text-xl py-2 bg-transparent placeholder-gray-300"
                                autoFocus
                            />
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded">CLOSE</button>
                                <button type="submit" className="flex-1 py-3 bg-[#E2136E] text-white font-bold rounded shadow-lg hover:bg-[#c2105e]">CONFIRM</button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div className="text-center text-gray-600 mb-6">
                                <p>Enter Verification Code sent to {phoneNumber}</p>
                            </div>
                            <input
                                type="text"
                                placeholder="OTP: 1234"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className="w-full border-b-2 border-gray-300 focus:border-[#E2136E] outline-none text-center text-xl py-2 bg-transparent placeholder-gray-300"
                                autoFocus
                            />
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded">CLOSE</button>
                                <button type="submit" className="flex-1 py-3 bg-[#E2136E] text-white font-bold rounded shadow-lg hover:bg-[#c2105e]">CONFIRM</button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handlePinSubmit} className="space-y-6">
                            <div className="text-center text-gray-600 mb-6">
                                <p>Enter PIN of your bKash Account</p>
                            </div>
                            <input
                                type="password"
                                placeholder="Enter PIN"
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                className="w-full border-b-2 border-gray-300 focus:border-[#E2136E] outline-none text-center text-xl py-2 bg-transparent placeholder-gray-300"
                                autoFocus
                            />
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded">CLOSE</button>
                                <button type="submit" className="flex-1 py-3 bg-[#E2136E] text-white font-bold rounded shadow-lg hover:bg-[#c2105e]">CONFIRM</button>
                            </div>
                        </form>
                    )}

                </div>

                {/* Footer */}
                <div className="bg-gray-100 p-3 text-center">
                    <p className="text-xs text-gray-400">Calls to 16247</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
