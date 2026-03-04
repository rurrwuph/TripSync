import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [summary, setSummary] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [trips, setTrips] = useState([]);
    const [pastTrips, setPastTrips] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [users, setUsers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Toast popup
    const [popup, setPopup] = useState({ show: false, type: 'success', message: '' });
    const showPopup = (type, message) => {
        setPopup({ show: true, type, message });
        setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3500);
    };

    // Edit trip modal
    const [editingTrip, setEditingTrip] = useState(null);
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');

    // Custom delete confirmation modal
    const [confirmDelete, setConfirmDelete] = useState({ show: false, tripId: null, route: '' });

    // Create trip form
    const [newTrip, setNewTrip] = useState({
        bus_id: '',
        from_location: '',
        to_location: '',
        departure_date: '',
        departure_time: '',
        base_fare: '',
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchSummary();
            fetchRoutes();
        } else if (activeTab === 'trips') {
            fetchTrips();
        } else if (activeTab === 'past') {
            fetchPastTrips();
        } else if (activeTab === 'refunds') {
            fetchRefunds();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'create') {
            fetchBuses();
        }
    }, [activeTab]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const res = await apiRequest('/admin/monitoring/summary');
            if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
            setSummary(await res.json());
        } catch (err) {
            showPopup('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const res = await apiRequest('/admin/monitoring/routes');
            if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
            setRoutes(await res.json());
        } catch (err) {
            showPopup('error', err.message);
        }
    };

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const res = await apiRequest('/admin/trips');
            if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
            setTrips(await res.json());
        } catch (err) {
            showPopup('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPastTrips = async () => {
        try {
            setLoading(true);
            const res = await apiRequest('/admin/monitoring/past-trips');
            if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
            setPastTrips(await res.json());
        } catch (err) {
            showPopup('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            const res = await apiRequest('/refunds');
            if (res.ok) setRefunds(await res.json());
        } catch (err) {
            showPopup('error', 'Failed to load refunds');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await apiRequest('/admin/users');
            if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
            setUsers(await res.json());
        } catch (err) {
            showPopup('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchBuses = async () => {
        try {
            const res = await apiRequest('/buses/');
            if (res.ok) setBuses(await res.json());
        } catch (err) {
            showPopup('error', 'Failed to load buses');
        }
    };

    const handleUpdateRefundStatus = async (refundId, status) => {
        try {
            const res = await apiRequest(`/refunds/${refundId}/status?status=${status}`, { method: 'PUT' });
            if (res.ok) {
                showPopup('success', `Refund ${status} successfully`);
                fetchRefunds();
                fetchSummary();
            } else {
                const err = await res.json();
                showPopup('error', err.detail || 'Failed to update');
            }
        } catch (err) {
            showPopup('error', 'Network error');
        }
    };

    const openEditModal = (trip) => {
        setEditingTrip(trip);
        if (trip.departure_time) {
            const dt = new Date(trip.departure_time);
            setEditDate(dt.toISOString().split('T')[0]);
            setEditTime(dt.toTimeString().slice(0, 5));
        }
    };

    const handleUpdateTrip = async () => {
        if (!editingTrip) return;
        try {
            const newDeparture = `${editDate}T${editTime}:00`;
            const res = await apiRequest(`/admin/trips/${editingTrip.id}`, {
                method: 'PUT',
                body: JSON.stringify({ departure_time: newDeparture })
            });
            if (res.ok) {
                const data = await res.json();
                const affectedCount = data.affected_passengers?.length || 0;
                showPopup('success', `Trip updated! ${affectedCount} passenger(s) will be notified.`);
                setEditingTrip(null);
                fetchTrips();
            } else {
                const err = await res.json();
                showPopup('error', err.detail || 'Update failed');
            }
        } catch (err) {
            showPopup('error', 'Network error');
        }
    };

    // Custom delete confirmation handlers
    const requestDeleteTrip = (trip) => {
        setConfirmDelete({ show: true, tripId: trip.id, route: trip.route });
    };

    const handleDeleteTrip = async () => {
        const tripId = confirmDelete.tripId;
        setConfirmDelete({ show: false, tripId: null, route: '' });
        try {
            const res = await apiRequest(`/admin/trips/${tripId}`, { method: 'DELETE' });
            if (res.ok) {
                showPopup('success', 'Trip deleted successfully');
                fetchTrips();
            } else {
                const err = await res.json();
                showPopup('error', err.detail || 'Delete failed');
            }
        } catch (err) {
            showPopup('error', 'Network error');
        }
    };

    // Create trip handler
    const handleCreateTrip = async (e) => {
        e.preventDefault();
        if (!newTrip.bus_id || !newTrip.from_location || !newTrip.to_location || !newTrip.departure_date || !newTrip.departure_time || !newTrip.base_fare) {
            showPopup('error', 'Please fill in all fields.');
            return;
        }
        setIsCreating(true);
        try {
            const departure_time = `${newTrip.departure_date}T${newTrip.departure_time}:00`;
            const route = `${newTrip.from_location} - ${newTrip.to_location}`;
            const res = await apiRequest('/trips/', {
                method: 'POST',
                body: JSON.stringify({
                    bus_id: parseInt(newTrip.bus_id),
                    route,
                    from_location: newTrip.from_location,
                    to_location: newTrip.to_location,
                    departure_time,
                    base_fare: parseFloat(newTrip.base_fare),
                })
            });
            if (res.ok) {
                showPopup('success', 'Trip created successfully!');
                setNewTrip({ bus_id: '', from_location: '', to_location: '', departure_date: '', departure_time: '', base_fare: '' });
                setActiveTab('trips');
            } else {
                const err = await res.json();
                showPopup('error', err.detail || 'Failed to create trip');
            }
        } catch (err) {
            showPopup('error', 'Network error');
        } finally {
            setIsCreating(false);
        }
    };

    const StatCard = ({ label, value, color = 'text-gray-900', sub }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{label}</h3>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );

    const TABS = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'trips', label: '🚌 Manage Trips' },
        { id: 'create', label: '➕ New Trip' },
        { id: 'past', label: '📅 Past Trips' },
        { id: 'refunds', label: '💸 Refunds' },
        { id: 'users', label: '👥 Users' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col min-h-screen">
                <h1 className="text-xl font-black mb-10 tracking-tight">TripSync <span className="text-blue-400">Admin</span></h1>
                <nav className="space-y-2 flex-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
                <button
                    onClick={() => navigate('/')}
                    className="w-full text-left py-3 px-4 rounded-xl text-sm font-bold text-red-400 hover:bg-red-900/30 transition mt-4"
                >
                    ← Exit to Home
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Popup Toast */}
                {popup.show && (
                    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-slide-in ${popup.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}>
                        {popup.type === 'success' ? '✓' : '✕'} {popup.message}
                    </div>
                )}

                {/* ============ DASHBOARD ============ */}
                {activeTab === 'dashboard' && (
                    <div>
                        <h2 className="text-3xl font-black mb-8">Monitoring Dashboard</h2>
                        {loading && <p className="text-gray-400 mb-4">Loading...</p>}
                        {summary && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                <StatCard label="Total Bookings" value={summary.total_bookings} color="text-blue-600" />
                                <StatCard label="Revenue Today" value={`৳${summary.net_revenue_today.toLocaleString()}`} color="text-green-600" sub={`Gross: ৳${summary.total_revenue_today.toLocaleString()} | Refunds: ৳${summary.total_refunds_today.toLocaleString()}`} />
                                <StatCard label="Revenue This Month" value={`৳${summary.total_revenue_month.toLocaleString()}`} color="text-indigo-600" />
                                <StatCard label="Net Revenue (After Refunds)" value={`৳${summary.net_revenue_month.toLocaleString()}`} color={summary.net_revenue_month >= 0 ? 'text-emerald-600' : 'text-red-600'} sub={`Refunds: ৳${summary.total_refunds_amount.toLocaleString()}`} />
                            </div>
                        )}

                        {/* Route Profitability */}
                        <h3 className="text-xl font-bold mb-4">Route Profitability</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Route</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Bookings</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Refunds</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Net Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {routes.map((r, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{r.route}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{r.total_bookings}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-green-600">৳{r.total_revenue.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-red-500">৳{r.total_refunds.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm font-black text-gray-900">৳{r.net_revenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {routes.length === 0 && (
                                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No route data yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ============ TRIPS ============ */}
                {activeTab === 'trips' && (
                    <div>
                        <h2 className="text-3xl font-black mb-8">Manage Trips</h2>
                        {loading && <p className="text-gray-400 mb-4">Loading...</p>}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Route</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Bus</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Departure</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Fare</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Bookings</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {trips.map(trip => (
                                        <tr key={trip.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-500">#{trip.id}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{trip.route}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{trip.bus_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(trip.departure_time).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">৳{trip.base_fare}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{trip.active_bookings}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(trip)}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                                                    >
                                                        Edit Time
                                                    </button>
                                                    <button
                                                        onClick={() => requestDeleteTrip(trip)}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {trips.length === 0 && (
                                        <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400">No trips found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ============ CREATE TRIP ============ */}
                {activeTab === 'create' && (
                    <div>
                        <h2 className="text-3xl font-black mb-2">New Trip</h2>
                        <p className="text-gray-400 text-sm mb-8">Schedule a new trip for an existing bus.</p>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-xl">
                            <form onSubmit={handleCreateTrip} className="space-y-5">
                                {/* Bus Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bus</label>
                                    <select
                                        value={newTrip.bus_id}
                                        onChange={e => setNewTrip(p => ({ ...p, bus_id: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                                    >
                                        <option value="">— Select a bus —</option>
                                        {buses.map(b => (
                                            <option key={b.id} value={b.id}>
                                                #{b.id} — {b.bus_number} ({b.type}, {b.total_seats} seats)
                                            </option>
                                        ))}
                                    </select>
                                    {buses.length === 0 && (
                                        <p className="text-xs text-red-400 mt-1">No buses found. Add buses via the API first.</p>
                                    )}
                                </div>

                                {/* From / To */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">From</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Dhaka"
                                            value={newTrip.from_location}
                                            onChange={e => setNewTrip(p => ({ ...p, from_location: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">To</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Chittagong"
                                            value={newTrip.to_location}
                                            onChange={e => setNewTrip(p => ({ ...p, to_location: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Route preview */}
                                {newTrip.from_location && newTrip.to_location && (
                                    <p className="text-xs text-indigo-600 font-bold">
                                        Route: {newTrip.from_location} - {newTrip.to_location}
                                    </p>
                                )}

                                {/* Departure Date + Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Departure Date</label>
                                        <input
                                            type="date"
                                            value={newTrip.departure_date}
                                            onChange={e => setNewTrip(p => ({ ...p, departure_date: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Departure Time</label>
                                        <input
                                            type="time"
                                            value={newTrip.departure_time}
                                            onChange={e => setNewTrip(p => ({ ...p, departure_time: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Base Fare */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Base Fare (৳)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 650"
                                        value={newTrip.base_fare}
                                        onChange={e => setNewTrip(p => ({ ...p, base_fare: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {isCreating ? 'Creating...' : '➕ Create Trip'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ============ PAST TRIPS ============ */}
                {activeTab === 'past' && (
                    <div>
                        <h2 className="text-3xl font-black mb-8">Past Trips</h2>
                        {loading && <p className="text-gray-400 mb-4">Loading...</p>}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Route</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Bus</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Departure</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Bookings</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pastTrips.map(trip => (
                                        <tr key={trip.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{trip.route}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{trip.bus_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(trip.departure_time).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{trip.bookings}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-green-600">৳{trip.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {pastTrips.length === 0 && (
                                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No past trips found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ============ REFUNDS ============ */}
                {activeTab === 'refunds' && (
                    <div>
                        <h2 className="text-3xl font-black mb-8">Refund Management</h2>
                        {loading && <p className="text-gray-400 mb-4">Loading...</p>}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Seats</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Cause</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {refunds.map(refund => (
                                        <tr key={refund.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{refund.seat_numbers || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">৳{refund.amount}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{refund.cause}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    refund.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {refund.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(refund.refund_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                {refund.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleUpdateRefundStatus(refund.id, 'approved')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition">Approve</button>
                                                        <button onClick={() => handleUpdateRefundStatus(refund.id, 'rejected')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition">Reject</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {refunds.length === 0 && (
                                        <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400">No refund requests found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ============ USERS ============ */}
                {activeTab === 'users' && (
                    <div>
                        <h2 className="text-3xl font-black mb-2">Registered Users</h2>
                        <p className="text-gray-400 text-sm mb-8">All users registered in the system.</p>
                        {loading && <p className="text-gray-400 mb-4">Loading...</p>}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-500">#{user.id}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{user.full_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-indigo-600">{user.reward_points.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400">No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* ===== Edit Trip Modal ===== */}
            {editingTrip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black mb-6">Edit Trip Schedule</h3>
                        <p className="text-sm text-gray-500 mb-4">Route: <span className="font-bold text-gray-900">{editingTrip.route}</span></p>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">New Date</label>
                                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">New Time</label>
                                <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setEditingTrip(null)} className="flex-1 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">Cancel</button>
                            <button onClick={handleUpdateTrip} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Custom Delete Confirmation Modal ===== */}
            {confirmDelete.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center text-2xl">🗑️</div>
                        <h3 className="text-xl font-black mb-2">Delete Trip?</h3>
                        <p className="text-sm text-gray-500 mb-1">Route: <span className="font-bold text-gray-900">{confirmDelete.route}</span></p>
                        <p className="text-xs text-red-500 mb-6">This action cannot be undone. Affected passengers will be notified by email.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setConfirmDelete({ show: false, tripId: null, route: '' })}
                                className="flex-1 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTrip}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
