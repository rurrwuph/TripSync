import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketChart from '../../components/TicketChart';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ total_tickets_sold: 0, total_active_buses: 0, pending_refunds: 0 });
    const [buses, setBuses] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [newBus, setNewBus] = useState({ bus_number: '', total_seats: 36, type: 'Non-AC' });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch Stats
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchStats();
        } else if (activeTab === 'buses') {
            fetchBuses();
        } else if (activeTab === 'refunds') {
            fetchRefunds();
        }
    }, [activeTab]);

    const getAuthHeaders = () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        return {
            'Content-Type': 'application/json',
            'user-email': user?.email || '' // Mock auth header
        };
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:8000/admin/dashboard/summary', { headers: getAuthHeaders() });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Failed to fetch summary');
            }
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error("Dashboard Summary Error:", err);
            setError(err.message);
        }
    };

    const fetchBuses = async () => {
        try {
            const res = await fetch('http://localhost:8000/admin/buses', { headers: getAuthHeaders() });
            const data = await res.json();
            setBuses(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRefunds = async () => {
        try {
            const res = await fetch('http://localhost:8000/refunds', { headers: getAuthHeaders() });
            const data = await res.json();
            setRefunds(data);
        } catch (err) {
            console.error("Fetch Refunds Error:", err);
        }
    };

    const handleUpdateRefundStatus = async (refundId, status) => {
        try {
            const res = await fetch(`http://localhost:8000/refunds/${refundId}/status?status=${status}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                fetchRefunds();
                fetchStats();
            } else {
                alert('Failed to update refund status');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBus = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/admin/buses', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newBus)
            });
            if (res.ok) {
                alert('Bus added successfully');
                fetchBuses();
                setNewBus({ bus_number: '', total_seats: 36, type: 'Non-AC' });
            } else {
                alert('Failed to add bus');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-black text-white p-6 shadow-xl">
                <h1 className="text-2xl font-bold mb-10">TripSync Admin</h1>
                <nav className="space-y-4">
                    <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left py-2 px-4 rounded ${activeTab === 'dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>Dashboard</button>
                    <button onClick={() => setActiveTab('buses')} className={`w-full text-left py-2 px-4 rounded ${activeTab === 'buses' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>Manage Buses</button>
                    <button onClick={() => setActiveTab('trips')} className={`w-full text-left py-2 px-4 rounded ${activeTab === 'trips' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>Schedule Trips</button>
                    <button onClick={() => setActiveTab('refunds')} className={`w-full text-left py-2 px-4 rounded ${activeTab === 'refunds' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>Refunds</button>
                    <button onClick={() => navigate('/')} className="w-full text-left py-2 px-4 rounded hover:bg-gray-800 text-red-400 mt-10">Exit</button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex justify-between items-center">
                        <p><strong>Error:</strong> {error}</p>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Dashboard Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-gray-500 font-medium">Total Tickets Sold</h3>
                                <p className="text-4xl font-bold mt-2">{stats.total_tickets_sold || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-gray-500 font-medium">Active Buses</h3>
                                <p className="text-4xl font-bold mt-2">{stats.total_active_buses || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-gray-500 font-medium">Pending Refunds</h3>
                                <p className="text-4xl font-bold mt-2 text-yellow-600">{stats.pending_refunds || 0}</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <TicketChart />
                        </div>
                    </div>
                )}

                {activeTab === 'buses' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Manage Buses</h2>

                        {/* Add Bus Form */}
                        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                            <h3 className="text-xl font-bold mb-4">Add New Bus</h3>
                            <form onSubmit={handleAddBus} className="flex flex-wrap gap-4 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                                    <input type="text" value={newBus.bus_number} onChange={e => setNewBus({ ...newBus, bus_number: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Seats</label>
                                    <input type="number" value={newBus.total_seats} onChange={e => setNewBus({ ...newBus, total_seats: parseInt(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select value={newBus.type} onChange={e => setNewBus({ ...newBus, type: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option value="Non-AC">Non-AC</option>
                                        <option value="AC">AC</option>
                                        <option value="Sleeper">Sleeper</option>
                                    </select>
                                </div>
                                <button type="submit" className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">Add Bus</button>
                            </form>
                        </div>

                        {/* Bus List Table */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {buses.map(bus => (
                                        <tr key={bus.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bus.bus_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.total_seats}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'refunds' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Manage Refunds</h2>
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket IDs</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cause</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {refunds.map(refund => (
                                        <tr key={refund.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {refund.seat_numbers || refund.ticket?.seat_number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                #{refund.ticket_ids || refund.ticket_id || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">৳{refund.amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{refund.cause}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {refund.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(refund.refund_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {refund.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateRefundStatus(refund.id, 'approved')}
                                                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateRefundStatus(refund.id, 'rejected')}
                                                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {refunds.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500">No refund requests found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'trips' && (
                    <div className="text-center py-20 bg-white rounded-xl shadow-md">
                        <h2 className="text-2xl font-bold text-gray-400">Coming Soon</h2>
                        <p className="text-gray-500">This module is under development.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
