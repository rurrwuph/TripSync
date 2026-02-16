import React from 'react'
import { Link } from 'react-router-dom'
import { Twitter, Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg text-xs">T</div>
              <span>TripSync</span>
            </Link>
            <p className="text-gray-500 font-medium leading-relaxed max-w-xs">
              Revolutionizing bus travel through intelligent synchronized booking systems.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Facebook].map((Icon, idx) => (
                <a key={idx} href="#" className="p-2.5 bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-heading font-black text-sm uppercase tracking-widest mb-8">Navigation</h5>
            <ul className="space-y-4">
              {['Home', 'Explore', 'About Us', 'Contact'].map(item => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-500 font-bold hover:text-black transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-heading font-black text-sm uppercase tracking-widest mb-8">Support</h5>
            <ul className="space-y-4">
              {['Help Center', 'Safety Information', 'Terms of Service', 'Privacy Policy'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-500 font-bold hover:text-black transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-heading font-black text-sm uppercase tracking-widest mb-8">Get in Touch</h5>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <MapPin size={20} className="text-gray-400 shrink-0" />
                <span className="text-gray-500 font-medium">123 Travel Avenue, Suite 400<br />Terminal District</span>
              </li>
              <li className="flex gap-4 items-center">
                <Mail size={20} className="text-gray-400 shrink-0" />
                <span className="text-gray-500 font-medium">support@tripsync.com</span>
              </li>
              <li className="flex gap-4 items-center">
                <Phone size={20} className="text-gray-400 shrink-0" />
                <span className="text-gray-500 font-medium">+1 (555) 000-SYNC</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm font-bold">
            © {new Date().getFullYear()} TripSync Technologies Inc. All rights reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-xs text-gray-300 font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              SYSTEM STATUS: OPERATIONAL
            </span>
            <span className="text-xs text-gray-300 font-bold">PCI COMPLIANT</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer