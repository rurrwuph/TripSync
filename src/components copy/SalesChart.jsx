import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';

const SalesChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Define Dummy Data for last 3 days (simulated)
                // Let's assume today is T. Dummy data for T-9, T-8, T-7.
                const dummyData = [
                    { date: 'Day-3', count: 5 },
                    { date: 'Day-2', count: 8 },
                    { date: 'Day-1', count: 12 },
                ];

                // 2. Fetch Real Data from Backend (last 7 days)
                const user = JSON.parse(localStorage.getItem('currentUser'));
                const response = await axios.get('http://localhost:8000/admin/sales-stats', {
                    headers: {
                        'user-email': user?.email || ''
                    }
                });

                const realData = response.data;

                // 3. Combine and Format
                // We'll just append them for now as per requirements.
                // In a real app, we might want to normalize dates.
                const combinedData = [...dummyData, ...realData];

                setData(combinedData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching sales stats:", err);
                setError("Failed to load sales data.");
                setLoading(false);

                // Fallback to dummy data even on error for visualization
                setData([
                    { date: 'Day-3', count: 5 },
                    { date: 'Day-2', count: 8 },
                    { date: 'Day-1', count: 12 },
                ]);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="h-64 flex items-center justify-center bg-white rounded-xl shadow-md">
            <p className="text-gray-500 animate-pulse">Loading sales chart...</p>
        </div>
    );

    if (error) return (
        <div className="h-64 flex items-center justify-center bg-white rounded-xl shadow-md border-red-200 border">
            <p className="text-red-500">{error} Showing dummy data instead.</p>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-6">Manager Dashboard - Sales Chart (Last 10 Days)</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar
                            dataKey="count"
                            name="Tickets Sold"
                            fill="#000000"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
