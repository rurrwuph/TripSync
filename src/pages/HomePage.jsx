import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users, Shield, Zap, MessageSquare, Compass, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_70%_30%,#f0f7ff_0%,#ffffff_100%)]"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center border">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                <Compass size={14} />
                <span>Modern Travel Guide</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
                Explore <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Without Limits</span>
              </h1>
              <p className="max-w-xl text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-10">
                Experience the next generation of bus travel. Seamless booking,
                AI-powered support, and a premium journey for every passenger.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/explore"
                  className="px-8 py-4 rounded-2xl bg-black text-white font-bold flex items-center gap-3 hover:bg-gray-800 transition-all hover:shadow-2xl hover:shadow-gray-200 active:scale-95 group"
                >
                  Book Your Trip
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 rounded-2xl bg-white text-gray-900 border border-gray-200 font-bold hover:bg-gray-50 transition-all active:scale-95"
                >
                  See How It Works
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-black">50k+</p>
                  <p className="text-sm text-gray-400 font-bold">Journeys</p>
                </div>
                <div>
                  <p className="text-2xl font-black">99.9%</p>
                  <p className="text-sm text-gray-400 font-bold">Reliability</p>
                </div>
                <div>
                  <p className="text-2xl font-black">4.9/5</p>
                  <p className="text-sm text-gray-400 font-bold">Rating</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl shadow-blue-100 border-8 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
                  alt="Modern Luxury Bus"
                  className="w-full h-[600px] object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-10">
                  <div className="text-white">
                    <p className="font-heading font-black text-2xl">Smart Fleet Premium</p>
                    <p className="opacity-80 font-medium">Equipped with 5G WiFi & Climate Control</p>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -left-10 bg-white p-5 rounded-3xl shadow-xl flex items-center gap-4 z-20 border border-gray-50"
              >
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm">Safe Travel</p>
                  <p className="text-[10px] text-gray-400 font-bold">VERIFIED OPERATORS</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-10 -right-5 bg-white p-5 rounded-3xl shadow-xl flex items-center gap-4 z-20 border border-gray-50"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm">Instant Ticket</p>
                  <p className="text-[10px] text-gray-400 font-bold">READY IN SECONDS</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Explore Section */}
        <section className="py-24 md:py-32 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">The TripSync Experience</h2>
              <p className="text-gray-500 font-medium text-lg italic">"A journey of a thousand miles begins with a single click."</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: <Zap className="text-orange-500" />,
                  title: 'Streamlined Booking',
                  desc: 'Pick your seat and pay in under 60 seconds with our high-performance checkout.',
                  color: 'bg-orange-50'
                },
                {
                  icon: <MessageSquare className="text-blue-500" />,
                  title: 'AI Smart Sync',
                  desc: 'Our intelligent assistant helps you find the best routes and answers queries 24/7.',
                  color: 'bg-blue-50'
                },
                {
                  icon: <Shield className="text-indigo-500" />,
                  title: 'Trusted Security',
                  desc: 'Every transaction is encrypted and every ticket is independently verified.',
                  color: 'bg-indigo-50'
                }
              ].map((card, idx) => (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-gray-100 transition-all group"
                >
                  <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <h4 className="text-2xl font-black mb-4 group-hover:text-blue-600 transition-colors">{card.title}</h4>
                  <p className="text-gray-500 font-medium leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px]"></div>

              <div className="relative z-10 max-w-3xl mx-auto">
                <h3 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to redefine your travel?</h3>
                <p className="text-gray-400 text-lg md:text-xl font-medium mb-12">
                  Join thousands of travelers who choose TripSync for a stress-free and modern booking experience.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
                >
                  Get Your Ticket Now
                  <ArrowRight size={24} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}