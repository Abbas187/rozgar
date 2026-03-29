import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import { PlusCircle, Search, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [myJobs, setMyJobs] = useState([]); // For buyers
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, jobsRes] = await Promise.all([
                    axiosInstance.get('/orders'),
                    user?.role === 'Buyer' ? axiosInstance.get('/jobs/myjobs') : Promise.resolve({ data: [] })
                ]);

                setOrders(ordersRes.data);
                if (user?.role === 'Buyer') {
                    setMyJobs(jobsRes.data);
                }
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) return <div className="text-center py-20 text-slate-500">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Welcome back, {user?.name}</p>
                </div>

                {user?.role === 'Buyer' && (
                    <Link to="/post-job" className="btn-primary flex items-center shadow-md">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Post a New Job
                    </Link>
                )}
                {user?.role === 'Provider' && (
                    <Link to="/browse-jobs" className="btn-primary flex items-center shadow-md">
                        <Search className="w-5 h-5 mr-2" />
                        Browse Jobs
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Active Orders Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center">
                            <ClipboardList className="w-5 h-5 mr-2 text-primary-500" />
                            My Orders
                        </h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
                            <p className="text-slate-500 mb-4">You have no active orders yet.</p>
                            {user?.role === 'Buyer' ? (
                                <Link to="/post-job" className="btn-secondary">Post a Job to get started</Link>
                            ) : (
                                <Link to="/browse-jobs" className="btn-secondary">Find jobs to apply for</Link>
                            )}
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{order.jobId?.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {user?.role === 'Buyer' ? `Provider: ${order.providerId?.name}` : `Buyer: ${order.buyerId?.name}`}
                                    </p>
                                    <div className="mt-3 flex items-center space-x-4">
                                        <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-200">
                                            Amount: ${order.amount}
                                        </span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <Link to={`/orders/${order._id}`} className="mt-4 sm:mt-0 btn-secondary text-sm w-full sm:w-auto text-center">
                                    View Order
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar details */}
                <div className="space-y-6">
                    {/* Wallet Balance Widget */}
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <h3 className="text-primary-100 font-medium mb-1">Wallet Balance</h3>
                        <div className="text-4xl font-bold">${user?.walletBalance || '0.00'}</div>
                        <p className="text-xs text-primary-200 mt-3 flex items-center">
                            <Shield className="w-3 h-3 mr-1" /> Secure Escrow System
                        </p>
                    </div>

                    {/* Buyer specific: My Posted Jobs */}
                    {user?.role === 'Buyer' && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-semibold text-slate-800">
                                Recently Posted Jobs
                            </div>
                            <div className="divide-y divide-slate-100">
                                {myJobs.slice(0, 3).map(job => (
                                    <Link key={job._id} to={`/jobs/${job._id}`} className="block px-6 py-4 hover:bg-slate-50 transition-colors">
                                        <div className="font-medium text-slate-900 truncate">{job.title}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex justify-between">
                                            <span>Status: {job.status}</span>
                                            <span className="text-primary-600">${job.budget}</span>
                                        </div>
                                    </Link>
                                ))}
                                {myJobs.length === 0 && (
                                    <div className="px-6 py-8 text-center text-sm text-slate-500">No jobs posted yet</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Quick helper
function Shield(props) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10a1 1 0 0 0 1 0Z" /></svg>
}

export default DashboardPage;
