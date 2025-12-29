import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const initialUserData = {
  fullName: 'Loading...',
  email: 'loading@tripsync.com',
  phoneNumber: 'N/A',
  accountType: 'Pending',
};

const ProfilePage = () => {

  const [userData, setUserData] = useState(initialUserData);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');

    if (loggedInUser) {
      try {
        const user = JSON.parse(loggedInUser);
        

        setUserData({
          // Assuming your user/admin objects have properties like 'name' or 'fullName'
          fullName: user.fullname || 'TripSync User', 
          email: user.email,
          phoneNumber: user.phone || 'Not provided',
          accountType: user.role === 'admin' ? 'Administrator Account' : 'Passenger Account',
        });
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        // Fallback or redirect if data is corrupt
      }
    } else {
      // If no user data is found in localStorage, redirect to login
      navigate('/login');
    }
  }, [navigate]);
  // ---------------------------

  // --- Button Handlers ---
  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleChangePassword = () => {
    navigate('/password/change');
  };

  // Helper function for the Avatar initial
  const getAvatarInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };


  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

    {/* Header */}
      <Header />

      {/* profile Content */}
      <main className="flex-grow">

        {/* Profile Header */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50 text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Your Profile
          </h2>
          <p className="text-xl text-gray-600">
            Manage your personal information and account settings
          </p>
        </section>

        {/* Profile Card */}

        <section className="py-24">

          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-3xl shadow-xl p-12">
              {/* Avatar + Name */}
              <div className="flex flex-col items-center text-center mb-14">
                <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600 mb-6">
                  {getAvatarInitial(userData.fullName)}
                </div>
                <h3 className="text-3xl font-bold">{userData.fullName}</h3>
                <p className="text-gray-500 mt-2">{userData.accountType}</p>
              </div>

                 {/* Profile Info */}
                 <div className="grid md:grid-cols-2 gap-10">
                  <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Full Name
                  </label>
                  <div className="text-lg font-semibold">
                    {userData.fullName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Email
                  </label>
                  <div className="text-lg font-semibold">
                    {userData.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Phone Number
                  </label>
                  <div className="text-lg font-semibold">
                    {userData.phoneNumber}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Account Type
                  </label>
                  <div className="text-lg font-semibold">
                    {userData.accountType}
                  </div>
                </div>


                {/* Actions */}

                <div className="mt-16 w-full flex flex-col md:flex-row justify-center items-center gap-6 md:col-span-2">
                  <button className="px-10 py-3 rounded-full border border-gray-300 hover:border-black transition">
                  Edit Profile
                </button>

                <button className="px-10 py-3 rounded-full bg-black text-white hover:bg-gray-800 transition">
                  Change Password
                </button>

                </div>

                 </div>
              

            </div>

          </div>

        </section>

      </main>

      <Footer/>

    </div>
  )
}

export default ProfilePage