import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Search, ClipboardList, Shield, Briefcase, PlusCircle, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ProviderDashboard = ({ user }) => {
    const [gigs, setGigs] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showGigModal, setShowGigModal] = useState(false);
    const [newGig, setNewGig] = useState({ title: '', category: '', experience_level: 'Intermediate', description: '', price: '' });
    const [creatingGig, setCreatingGig] = useState(false);

    const categories = ['Web Development', 'Graphic Design', 'Writing & Translation', 'Digital Marketing', 'Video & Animation', 'Music & Audio', 'Business', 'Lifestyle'];

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data: gigsData, error: gigsError } = await supabase
                .from('gigs')
                .select('*')
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false });

            if (gigsError && gigsError.code !== '42P01') throw gigsError;
            setGigs(gigsData || []);

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*, jobId:jobs(*), providerId:users(*), buyerId:users(*)')
                .eq('providerId', user.id);

            if (!ordersError) {
                const formattedOrders = ordersData.map(o => ({
                    ...o,
                    _id: o.id,
                    jobId: { ...o.jobId, _id: o.jobId?.id },
                    providerId: { ...o.providerId, _id: o.providerId?.id },
                    buyerId: { ...o.buyerId, _id: o.buyerId?.id }
                }));
                setOrders(formattedOrders);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user.id]);

    const handleCreateGig = async (e) => {
        e.preventDefault();
        if (gigs.length >= 7) {
            toast.error('You can only have up to 7 active Gigs.');
            return;
        }

        if (!newGig.title || !newGig.category || !newGig.price) {
            toast.error('Please fill required fields.');
            return;
        }

        setCreatingGig(true);
        try {
            const { error } = await supabase.from('gigs').insert([{
                provider_id: user.id,
                title: newGig.title,
                category: newGig.category,
                experience_level: newGig.experience_level,
                description: newGig.description,
                price: parseFloat(newGig.price)
            }]);

            if (error) throw error;
            toast.success('Gig created successfully!');
            setShowGigModal(false);
            setNewGig({ title: '', category: '', experience_level: 'Intermediate', description: '', price: '' });
            fetchDashboardData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create Gig.');
        } finally {
            setCreatingGig(false);
        }
    };

    const activeOrders = orders.filter(o => o.status !== 'Completed');
    const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;

    if (loading) return <div className="text-center py-20 text-emerald-500 font-medium">Loading your workspace...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center mb-8 border-b border-emerald-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-900">Provider Dashboard</h1>
                    <p className="text-emerald-700 mt-1">Manage your Gigs and Active Orders.</p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowGigModal(true)}
                        disabled={gigs.length >= 7}
                        className={`px-5 py-2.5 rounded-lg flex items-center shadow-md font-medium transition duration-200 ${gigs.length >= 7 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Create New Gig
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-emerald-50">
                        <h2 className="text-xl font-bold text-emerald-900 flex items-center">
                            <Star className="w-5 h-5 mr-2 text-emerald-500" />
                            My Published Gigs ({gigs.length}/7)
                        </h2>
                    </div>

                    {gigs.length === 0 ? (
                        <div className="bg-white p-10 rounded-xl border border-emerald-100 text-center shadow-sm">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-emerald-600 mb-4 font-medium">You don't have any active Gigs offering your services.</p>
                            <button onClick={() => setShowGigModal(true)} className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-100 transition shadow-sm">
                                Create your first Gig
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gigs.map(gig => (
                                <Link to={`/gigs/${gig.id}`} key={gig.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition group relative overflow-hidden block">
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        ${gig.price}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 pr-10 truncate group-hover:text-emerald-700 transition-colors">{gig.title}</h3>
                                    <div className="text-xs text-slate-500 mt-2 font-medium bg-slate-100 inline-block px-2 py-1 rounded">
                                        {gig.category}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">{gig.description}</p>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="mt-10">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center mb-4">
                            <ClipboardList className="w-5 h-5 mr-2 text-emerald-600" />
                            Recent Active Contracts
                        </h2>
                        {orders.length === 0 && (
                            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm shadow-sm">No active contracts assigned to your gigs yet.</div>
                        )}
                        {orders.map(order => (
                            <div key={order._id} className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-500 mb-3 shadow-sm flex justify-between items-center hover:bg-slate-50 transition">
                                <div>
                                    <h3 className="font-bold text-slate-800">{order.jobId?.title || 'Custom Contract'}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Client: <span className="font-medium text-slate-700">{order.buyerId?.name}</span></p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-emerald-600">${order.amount}</div>
                                    <div className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded mt-1">{order.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <h3 className="text-emerald-100 font-medium mb-1 drop-shadow-sm">Total Earnings Balance</h3>
                        <div className="text-4xl font-black tracking-tight">${user.walletBalance || '0.00'}</div>
                        <p className="text-xs text-emerald-200 mt-3 flex items-center">
                            <Shield className="w-3 h-3 mr-1" /> Withdrawals coming soon
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 flex flex-col space-y-4">
                        <h3 className="font-bold text-emerald-900 border-b border-emerald-50 pb-2">Your Impact</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 text-sm">Active Gigs</span>
                            <span className="font-black text-emerald-600 text-lg">{gigs.length}/7</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 text-sm">Active Contracts</span>
                            <span className="font-black text-amber-500 text-lg">{activeOrders.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 text-sm">Completed Returns</span>
                            <span className="font-black text-emerald-600 text-lg">{completedOrdersCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showGigModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                                <PlusCircle className="w-6 h-6 mr-2 text-emerald-500" />
                                Create a New Gig
                            </h2>
                            <button onClick={() => setShowGigModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-200 p-2 rounded-full transition"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleCreateGig} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Gig Title</label>
                                    <input type="text" placeholder="e.g. I will design a modern logo for your business" className="input-field py-3 bg-slate-50 focus:bg-white text-lg font-medium" value={newGig.title} onChange={e => setNewGig({ ...newGig, title: e.target.value })} required />
                                    <p className="text-xs text-slate-500 mt-1.5">Make it catchy! This is the first thing buyers see.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                                        <select className="input-field py-3 bg-slate-50 focus:bg-white font-medium text-slate-700" value={newGig.category} onChange={e => setNewGig({ ...newGig, category: e.target.value })} required>
                                            <option value="">Select a Category</option>
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Experience Level</label>
                                        <select className="input-field py-3 bg-slate-50 focus:bg-white font-medium text-slate-700" value={newGig.experience_level} onChange={e => setNewGig({ ...newGig, experience_level: e.target.value })}>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Expert">Expert</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Pricing ($ USD)</label>
                                    <input type="number" min="5" placeholder="50" className="input-field py-3 bg-slate-50 focus:bg-white font-bold text-emerald-600 text-lg" value={newGig.price} onChange={e => setNewGig({ ...newGig, price: e.target.value })} required />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                                    <textarea rows="5" placeholder="Detail exactly what you will deliver, your process, and why they should choose you..." className="input-field py-3 bg-slate-50 focus:bg-white resize-none text-slate-600" value={newGig.description} onChange={e => setNewGig({ ...newGig, description: e.target.value })} required></textarea>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
                                    <button type="button" onClick={() => setShowGigModal(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition">Cancel</button>
                                    <button type="submit" disabled={creatingGig} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg font-bold flex items-center transition-all disabled:opacity-50">
                                        {creatingGig ? 'Publishing...' : 'Publish Gig to Marketplace'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;
