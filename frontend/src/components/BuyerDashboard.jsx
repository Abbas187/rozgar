import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle, ClipboardList, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const BuyerDashboard = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch orders for buyer
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('*, jobId:jobs(*), providerId:users(*), buyerId:users(*)')
                    .eq('buyerId', user.id);

                if (ordersError) throw ordersError;

                const formattedOrders = ordersData.map(o => ({
                    ...o,
                    _id: o.id,
                    jobId: { ...o.jobId, _id: o.jobId?.id },
                    providerId: { ...o.providerId, _id: o.providerId?.id },
                    buyerId: { ...o.buyerId, _id: o.buyerId?.id }
                }));

                setOrders(formattedOrders);

                // Fetch jobs for buyer
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('buyerId', user.id)
                    .order('created_at', { ascending: false });

                if (jobsError) throw jobsError;

                setMyJobs(jobsData.map(j => ({ ...j, _id: j.id })));
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.id]);

    if (loading) return <div className="text-center py-20 text-blue-500">Loading your dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center mb-8 border-b border-blue-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-blue-900">Buyer Dashboard</h1>
                    <p className="text-blue-600 mt-1">Welcome back, {user.name}!</p>
                </div>

                <Link to="/post-job" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition duration-200 font-medium">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Post a New Job
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Orders Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-50">
                        <h2 className="text-xl font-bold text-blue-900 flex items-center">
                            <ClipboardList className="w-5 h-5 mr-2 text-blue-500" />
                            My Orders (Contracts)
                        </h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-blue-100 text-center shadow-sm">
                            <p className="text-blue-400 mb-4">You have no active orders yet.</p>
                            <Link to="/post-job" className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition">
                                Post a Job to get started
                            </Link>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-xl border-l-4 border-l-blue-500 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{order.jobId?.title || 'Unknown Job'}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Provider: <span className="font-medium text-slate-700">{order.providerId?.name || 'N/A'}</span>
                                    </p>
                                    <div className="mt-3 flex items-center space-x-4">
                                        <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-bold border border-blue-100">
                                            Amount: ${order.amount}
                                        </span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <Link to={`/orders/${order._id}`} className="mt-4 sm:mt-0 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm text-slate-700 font-medium transition w-full sm:w-auto text-center">
                                    View Order
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar details */}
                <div className="space-y-6">
                    {/* Wallet Balance Widget */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <h3 className="text-blue-100 font-medium mb-1 drop-shadow-sm">Wallet Balance</h3>
                        <div className="text-4xl font-bold tracking-tight">${user.walletBalance || '0.00'}</div>
                        <p className="text-xs text-blue-200 mt-3 flex items-center">
                            <Shield className="w-3 h-3 mr-1" /> Secure Escrow System
                        </p>
                    </div>

                    {/* Buyer specific: My Posted Jobs */}
                    <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 font-bold text-blue-900">
                            Recently Posted Jobs
                        </div>
                        <div className="divide-y divide-blue-50">
                            {myJobs.slice(0, 3).map(job => (
                                <Link key={job._id} to={`/jobs/${job._id}`} className="block px-6 py-4 hover:bg-blue-50/50 transition-colors">
                                    <div className="font-semibold text-slate-800 truncate">{job.title}</div>
                                    <div className="text-xs text-slate-500 mt-1.5 flex justify-between items-center">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{job.status}</span>
                                        <span className="text-blue-600 font-bold">${job.budget}</span>
                                    </div>
                                </Link>
                            ))}
                            {myJobs.length === 0 && (
                                <div className="px-6 py-8 text-center text-sm text-blue-400">No jobs posted yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
