import React from 'react'

const Footer = () => {
  return (
    <div>
        <footer className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-600">
          <p>© 2025 TripSync. All rights reserved.</p>
          <div className="space-x-10 mt-4 md:mt-0">
            {['Privacy Policy','Terms of Service'].map(link => (
              <a key={link} href="#" className="hover:text-black transition">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer