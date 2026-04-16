import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Search, ClipboardList, Shield, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const ProviderDashboard = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch orders for provider
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('*, jobId:jobs(*), providerId:users(*), buyerId:users(*)')
                    .eq('providerId', user.id);

                if (ordersError) throw ordersError;

                const formattedOrders = ordersData.map(o => ({
                    ...o,
                    _id: o.id,
                    jobId: { ...o.jobId, _id: o.jobId?.id },
                    providerId: { ...o.providerId, _id: o.providerId?.id },
                    buyerId: { ...o.buyerId, _id: o.buyerId?.id }
                }));

                setOrders(formattedOrders);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.id]);

    // Derived stats
    const activeOrders = orders.filter(o => o.status !== 'Completed');
    const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;

    if (loading) return <div className="text-center py-20 text-emerald-500">Loading your workspace...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center mb-8 border-b border-emerald-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-900">Provider Dashboard</h1>
                    <p className="text-emerald-700 mt-1">Welcome back, {user.name}. Ready to work?</p>
                </div>

                <Link to="/browse-jobs" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition duration-200 font-medium">
                    <Search className="w-5 h-5 mr-2" />
                    Find More Jobs
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Orders Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-emerald-50">
                        <h2 className="text-xl font-bold text-emerald-900 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-emerald-500" />
                            My Active Gigs
                        </h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white p-10 rounded-xl border border-emerald-100 text-center shadow-sm">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-emerald-600 mb-4 font-medium">You don't have any active jobs right now.</p>
                            <Link to="/browse-jobs" className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-100 transition shadow-sm">
                                Browse Available Jobs
                            </Link>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-xl border-l-4 border-l-emerald-500 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{order.jobId?.title || 'Unknown Job'}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Client (Buyer): <span className="font-medium text-slate-700">{order.buyerId?.name || 'N/A'}</span>
                                    </p>
                                    <div className="mt-3 flex items-center space-x-4">
                                        <span className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold border border-emerald-100">
                                            Earning: ${order.amount}
                                        </span>
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${order.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <Link to={`/orders/${order._id}`} className="mt-4 sm:mt-0 bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 px-5 py-2.5 rounded-lg text-sm text-emerald-800 font-bold transition w-full sm:w-auto text-center shadow-sm">
                                    Manage Gig
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar details */}
                <div className="space-y-6">
                    {/* Earnings / Balance Widget */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <h3 className="text-emerald-100 font-medium mb-1 drop-shadow-sm">Total Earnings Balance</h3>
                        <div className="text-4xl font-black tracking-tight">${user.walletBalance || '0.00'}</div>
                        <p className="text-xs text-emerald-200 mt-3 flex items-center">
                            <Shield className="w-3 h-3 mr-1" /> Withdrawals coming soon
                        </p>
                    </div>

                    {/* Stats Widget */}
                    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 flex flex-col space-y-4">
                        <h3 className="font-bold text-emerald-900 border-b border-emerald-50 pb-2">Your Impact</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 text-sm">Active Contracts</span>
                            <span className="font-black text-amber-500 text-lg">{activeOrders.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 text-sm">Completed Gigs</span>
                            <span className="font-black text-emerald-600 text-lg">{completedOrdersCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
