import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';

const TicketChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicketStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                const res = await axios.get('http://localhost:8000/admin/ticket-stats', {
                    headers: { 'user-email': user?.email || '' }
                });

                const rawData = res.data; // e.g. [{date: '2026-01-25', count: 10}]

                // --- Fill missing dates for last 7 days ---
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    last7Days.push(d.toISOString().split('T')[0]);
                }

                const formattedData = last7Days.map(dateStr => {
                    const found = rawData.find(item => item.date === dateStr);
                    return {
                        date: dateStr,
                        count: found ? found.count : 0
                    };
                });

                setData(formattedData);
            } catch (err) {
                console.error("Error fetching ticket stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketStats();
    }, []);

    if (loading) return (
        <div className="h-64 flex items-center justify-center bg-white rounded-xl shadow-md">
            <p className="text-gray-500 animate-pulse">Fetching sales trends...</p>
        </div>
    );

    const hasData = data.some(d => d.count > 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md relative">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Weekly Ticket Sales</h3>
            {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 pointer-events-none">
                    <p className="text-gray-400 font-medium italic">No sales data found for the last 7 days</p>
                </div>
            )}
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" />
                        <Bar
                            dataKey="count"
                            name="Tickets Booked"
                            fill="#3b82f6"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TicketChart;
