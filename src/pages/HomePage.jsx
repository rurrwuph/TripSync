import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";


export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <Header></Header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="py-16 md:py-32 text-center bg-gradient-to-b from-white to-gray-50">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-10 px-4">
            Travel Smarter
            <span className="block text-gray-600">with TripSync</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed px-4">
            A modern online bus ticket booking platform built for simplicity,
            reliability, and intelligent assistance.
          </p>
        </section>

        {/* Explore Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl md:text-5xl font-bold mb-12 md:mb-16 text-center">Explore TripSync</h3>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[{
                title: 'Easy Booking',
                desc: 'Book tickets effortlessly using a clean and intuitive interface.'
              },{
                title: 'AI Assistance',
                desc: 'Chatbot and voice support guide you anytime, anywhere.'
              },{
                title: 'Secure Platform',
                desc: 'Your data and payments are protected with modern security.'
              }].map(card => (
                <div key={card.title} className="bg-white rounded-3xl p-8 md:p-10 text-center shadow-lg transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl">
                  <h4 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-5">{card.title}</h4>
                  <p className="text-gray-600 text-base md:text-lg">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-gray-100 py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h3 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8">Why TripSync?</h3>
            <p className="text-lg md:text-xl leading-relaxed text-gray-600">
              TripSync is designed for a single transport organization to digitize
              bus operations while offering passengers a fast, accessible, and
              intelligent booking experience.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer></Footer>
    </div>
  );
}