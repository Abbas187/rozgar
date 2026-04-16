import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Search, ClipboardList, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const BuyerDashboard = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [featuredGigs, setFeaturedGigs] = useState([]);
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

                // Fetch a few gigs as recommendations
                const { data: gigsData, error: gigsError } = await supabase
                    .from('gigs')
                    .select('*, provider_id(*)')
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (!gigsError) {
                    setFeaturedGigs(gigsData || []);
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.id]);

    if (loading) return <div className="text-center py-20 text-blue-500 font-medium">Loading your dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center mb-8 border-b border-blue-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-blue-900">Buyer Dashboard</h1>
                    <p className="text-blue-600 mt-1">Welcome back, {user.name}!</p>
                </div>

                <Link to="/browse-gigs" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition duration-200 font-bold">
                    <Search className="w-5 h-5 mr-2" />
                    Browse Services
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Orders Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-50">
                        <h2 className="text-xl font-bold text-blue-900 flex items-center">
                            <ClipboardList className="w-5 h-5 mr-2 text-blue-500" />
                            My Active Orders
                        </h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white p-10 rounded-xl border border-blue-100 text-center shadow-sm">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-blue-500 mb-4 font-bold text-lg">You have no active orders.</p>
                            <Link to="/browse-gigs" className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-8 py-3 rounded-xl font-black tracking-wide hover:bg-blue-100 transition shadow-sm uppercase text-sm">
                                Explore Marketplace
                            </Link>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-xl border-l-4 border-l-blue-500 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition hover:bg-blue-50/20">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{order.jobId?.title || 'Unknown Gig Order'}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Provider: <span className="font-medium text-slate-700">{order.providerId?.name || 'N/A'}</span>
                                    </p>
                                    <div className="mt-3 flex items-center space-x-4">
                                        <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-bold border border-blue-100">
                                            Amount: ${order.amount}
                                        </span>
                                        <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-black ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <Link to={`/orders/${order._id}`} className="mt-4 sm:mt-0 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm text-blue-800 font-bold transition w-full sm:w-auto text-center shadow-sm">
                                    View Contract
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar details */}
                <div className="space-y-6">
                    {/* Wallet Balance Widget */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <h3 className="text-blue-100 font-medium mb-1 drop-shadow-sm">Wallet Balance</h3>
                        <div className="text-4xl font-black tracking-tight">${user.walletBalance || '0.00'}</div>
                        <p className="text-xs text-blue-200 mt-3 flex items-center">
                            <Shield className="w-3 h-3 mr-1" /> Secure Escrow System
                        </p>
                    </div>

                    {/* Featured Gigs Recommendations */}
                    <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-100 font-black text-blue-900 flex justify-between items-center text-lg tracking-tight">
                            <span>Recommended Gigs</span>
                            <Zap className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="divide-y divide-blue-50">
                            {featuredGigs.map(gig => (
                                <Link key={gig.id} to={`/gigs/${gig.id}`} className="block px-6 py-5 hover:bg-blue-50/50 transition-colors group">
                                    <div className="font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors text-sm">{gig.title}</div>
                                    <div className="text-xs text-slate-500 mt-3 flex justify-between items-center">
                                        <span className="flex items-center">
                                            <span className="w-5 h-5 rounded-full bg-slate-200 inline-block mr-2 overflow-hidden border border-slate-200">
                                                {gig.provider_id?.profilePicture && <img src={gig.provider_id.profilePicture} alt="" className="w-full h-full object-cover" />}
                                            </span>
                                            <span className="truncate w-24 font-semibold text-slate-600">{gig.provider_id?.name || 'Provider'}</span>
                                        </span>
                                        <span className="text-blue-700 font-black text-lg">${gig.price}</span>
                                    </div>
                                </Link>
                            ))}
                            {featuredGigs.length === 0 && (
                                <div className="px-6 py-8 text-center text-sm text-blue-400 font-medium">No gigs available yet</div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                            <Link to="/browse-gigs" className="text-sm font-black uppercase tracking-wider text-blue-600 hover:text-blue-800">View Entire Marketplace &rarr;</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
