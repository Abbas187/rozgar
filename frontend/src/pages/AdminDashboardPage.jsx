import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { ShieldAlert, Users, Briefcase, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import dayjs from 'dayjs';

const AdminDashboardPage = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('orders'); // 'users', 'jobs', 'orders'

    const [usersList, setUsersList] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'Admin') return;
        fetchAdminData();
    }, [user]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [usersRes, jobsRes, ordersRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('jobs').select('*'),
                supabase.from('orders').select('*, jobId:jobs(*)')
            ]);

            if (usersRes.error) throw usersRes.error;
            if (jobsRes.error) throw jobsRes.error;
            if (ordersRes.error) throw ordersRes.error;

            setUsersList(usersRes.data);
            setJobs(jobsRes.data);
            setOrders(ordersRes.data);
        } catch (error) {
            toast.error('Failed to load admin data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDispute = async (orderId, action) => {
        if (!window.confirm(`Are you sure you want to ${action === 'RefundBuyer' ? 'Refund the Buyer' : 'Release funds to Provider'}?`)) return;

        try {
            const newPaymentStatus = action === 'RefundBuyer' ? 'Refunded' : 'Released';
            const { error } = await supabase.from('orders').update({ payment_status: newPaymentStatus, status: 'Completed' }).eq('id', orderId);

            if (error) throw error;

            toast.success('Dispute resolved successfully');
            fetchAdminData();
        } catch (error) {
            toast.error('Failed to resolve dispute: ' + error.message);
        }
    };

    if (user?.role !== 'Admin') {
        return <Navigate to="/" replace />;
    }

    if (loading) return <div className="text-center py-20">Loading Admin Dashboard...</div>;

    const disputes = orders.filter(o => o.status === 'Dispute');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center space-x-3 mb-8">
                <ShieldAlert className="w-8 h-8 text-red-600" />
                <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
            </div>

            {disputes.length > 0 && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                        <ShieldAlert className="w-5 h-5 mr-2" />
                        Active Disputes Require Attention ({disputes.length})
                    </h2>
                    <div className="space-y-4">
                        {disputes.map(dispute => (
                            <div key={dispute.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between border border-red-100">
                                <div>
                                    <p className="font-bold">Order ID: {dispute.id}</p>
                                    <p className="text-sm text-slate-600">Amount: ${dispute.amount} | Held in Escrow</p>
                                </div>
                                <div className="space-x-3">
                                    <button
                                        onClick={() => handleDispute(dispute.id, 'RefundBuyer')}
                                        className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        Refund Buyer
                                    </button>
                                    <button
                                        onClick={() => handleDispute(dispute.id, 'ReleaseToProvider')}
                                        className="btn-primary"
                                    >
                                        Release to Provider
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-3 font-medium text-sm flex items-center border-b-2 transition-colors ${activeTab === 'orders' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <ClipboardList className="w-4 h-4 mr-2" /> Orders
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`px-4 py-3 font-medium text-sm flex items-center border-b-2 transition-colors ${activeTab === 'jobs' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Briefcase className="w-4 h-4 mr-2" /> Jobs
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-3 font-medium text-sm flex items-center border-b-2 transition-colors ${activeTab === 'users' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Users className="w-4 h-4 mr-2" /> Users
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {activeTab === 'orders' && (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Job Title</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{order.id}</td>
                                    <td className="px-6 py-4">{order.jobId?.title || 'Unknown Job'}</td>
                                    <td className="px-6 py-4 font-bold">${order.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : order.status === 'Dispute' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{order.payment_status || order.paymentStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'users' && (
                    <div className="p-8 text-center text-slate-500">
                        {usersList.length} Users registered on the platform.
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="p-8 text-center text-slate-500">
                        {jobs.length} Jobs posted on the platform.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
