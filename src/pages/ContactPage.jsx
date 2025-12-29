import React, { useState } from "react";
import { Link } from "react-router-dom";
import emailjs from '@emailjs/browser';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmailError('');

    // --- VALIDATION ---
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (!allowedDomains.includes(emailDomain)) {
      setEmailError('Please use a popular email provider (e.g., @gmail.com, @yahoo.com)');
      return;
    }

    setIsSending(true);

    // --- EMAILJS CONFIGURATION ---
    const SERVICE_ID = "service_jtctzzr";      //Service ID
    const PUBLIC_KEY = "UQ0VnP4kdNDFdGUyj";      //Public Key
    
    // You now have TWO template IDs
    const TEMPLATE_ID_ADMIN = "template_cy60y3l"; // ID for the email sent to YOU
    const TEMPLATE_ID_USER  = "template_kcmaig8";  // ID for the auto-reply to USER

    const templateParams = {
      user_name: name,
      user_email: email,
      message: message,
    };

    // --- SEND BOTH EMAILS PARALLEL ---
    // We use Promise.all to send both at the same time
    Promise.all([
      emailjs.send(SERVICE_ID, TEMPLATE_ID_ADMIN, templateParams, PUBLIC_KEY),
      emailjs.send(SERVICE_ID, TEMPLATE_ID_USER, templateParams, PUBLIC_KEY)
    ])
    .then(() => {
        console.log('BOTH EMAILS SENT SUCCESSFULLY!');
        
        // Reset Form
        setName('');
        setEmail('');
        setMessage('');
        setIsSending(false);
        setShowModal(true); // Show success popup
    })
    .catch((err) => {
        console.log('FAILED...', err);
        alert("Something went wrong. Please try again later.");
        setIsSending(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <header className="bg-white border-b border-gray-200 py-3 px-6">
        <Link to="/" className="text-2xl font-bold text-black hover:text-gray-700">TripSync</Link>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="mb-6 text-gray-700">Have questions? Fill out the form below.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
          <div className="flex flex-col">
            <label className="mb-2 font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSending}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              required
              disabled={isSending}
              className={`border rounded-xl px-4 py-3 focus:outline-none focus:border-black ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {emailError && <p className="text-red-500 text-sm mt-2 font-medium">{emailError}</p>}
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={isSending}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black min-h-[120px] resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSending}
            className={`w-full py-3 text-white rounded-xl transition ${
              isSending ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {isSending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </main>

      {/* --- POPUP MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowModal(false)} 
          ></div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center relative z-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Message Sent!</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Thank you for reaching out. We will get back to you shortly.
            </p>
            <p className="text-sm font-bold text-gray-900 mb-8">- TripSync Team</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}