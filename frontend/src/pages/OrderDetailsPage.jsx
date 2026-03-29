import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { ShieldCheck, Send, MessageSquare, Shield, CheckCircle } from 'lucide-react';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const { user } = useAuthStore();
    const [order, setOrder] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const endOfChatRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        fetchOrderDetails();
        fetchChatHistory();

        // Initialize Socket
        const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
        socketRef.current = io(socketUrl);

        socketRef.current.emit('join_chat', id);

        socketRef.current.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [id]);

    useEffect(() => {
        endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchOrderDetails = async () => {
        try {
            // Find the specific order from the list
            const res = await axiosInstance.get('/orders');
            const currentOrder = res.data.find(o => o._id === id);
            if (currentOrder) setOrder(currentOrder);
        } catch (error) {
            toast.error('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    const fetchChatHistory = async () => {
        try {
            const res = await axiosInstance.get(`/chat/${id}`);
            setMessages(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await axiosInstance.post(`/chat/${id}`, { content: newMessage });
            const savedMessage = res.data;

            // Emit to socket
            socketRef.current.emit('send_message', {
                ...savedMessage,
                chatId: id
            });

            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const handleDepositToEscrow = async () => {
        try {
            const res = await axiosInstance.post(`/orders/${id}/escrow`);
            toast.success('Funds securely deposited to Escrow!');
            setOrder(res.data);
        } catch (error) {
            toast.error('Failed to deposit funds');
        }
    };

    const handleReleasePayment = async () => {
        if (!window.confirm('Are you sure the job is completed? This will release the funds to the provider.')) return;
        try {
            const res = await axiosInstance.post(`/orders/${id}/release`);
            toast.success('Funds released to Provider. Job completed!');
            setOrder(res.data);
        } catch (error) {
            toast.error('Failed to release funds');
        }
    };

    if (loading) return <div className="text-center py-20">Loading order...</div>;
    if (!order) return <div className="text-center py-20">Order not found.</div>;

    const isBuyer = user?._id === order.buyerId?._id;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left Col: Order Info & Actions */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center border-b pb-4">
                            <ShieldCheck className="w-6 h-6 mr-2 text-primary-600" />
                            Order Summary
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm border-b pb-2 mb-2 font-medium text-slate-500">Job Title</p>
                                <p className="font-semibold text-slate-900">{order.jobId?.title || 'Job Title'}</p>
                            </div>

                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-slate-600 font-medium text-sm">Agreed Amount</span>
                                <span className="text-lg font-bold text-emerald-600">${order.amount}</span>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-2">Order Status</p>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700`}>
                                    {order.status}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-2">Payment Status</p>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${order.paymentStatus === 'Held_in_Escrow' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                        order.paymentStatus === 'Released' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                            'bg-slate-100 text-slate-800 border-slate-200'
                                    }`}>
                                    {order.paymentStatus.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Buyer Actions */}
                        {isBuyer && (
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4">Buyer Actions</h3>

                                {order.paymentStatus === 'Pending' && (
                                    <button onClick={handleDepositToEscrow} className="w-full btn-primary py-3 flex justify-center items-center shadow-md bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700">
                                        <Shield className="w-5 h-5 mr-2" />
                                        Deposit to Escrow
                                    </button>
                                )}

                                {order.paymentStatus === 'Held_in_Escrow' && (
                                    <button onClick={handleReleasePayment} className="w-full btn-primary py-3 flex justify-center items-center shadow-md bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-none">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Job Done! Release Funds
                                    </button>
                                )}

                                {order.paymentStatus === 'Released' && (
                                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-center font-medium">
                                        Funds Released. Job Completed.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Provider Notice */}
                        {!isBuyer && (
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4">Status Update</h3>
                                {order.paymentStatus === 'Pending' && (
                                    <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm border border-amber-100">
                                        Waiting for buyer to deposit funds to Escrow. Do not start work yet.
                                    </div>
                                )}
                                {order.paymentStatus === 'Held_in_Escrow' && (
                                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-100">
                                        Funds securely held in Escrow! You can now start the work.
                                    </div>
                                )}
                                {order.paymentStatus === 'Released' && (
                                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-100 font-medium text-center">
                                        Funds released to your wallet. Great job!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Chat Interface */}
                <div className="w-full lg:w-2/3 flex flex-col h-[700px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
                        <h2 className="font-bold text-slate-800">Order Chat</h2>
                    </div>

                    <div className="flex-grow p-6 overflow-y-auto bg-slate-50 space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                No messages yet. Say hello!
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${isMe ? 'bg-primary-600 text-white rounded-br-sm shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                                            }`}>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={endOfChatRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center">
                        <input
                            type="text"
                            className="flex-grow input-field py-3 bg-slate-50 focus:bg-white transition-colors"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="ml-3 p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                            disabled={!newMessage.trim()}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailsPage;
