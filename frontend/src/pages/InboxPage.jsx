import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/useAuthStore';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const InboxPage = () => {
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchInbox = async () => {
            try {
                // Fetch all messages for current user
                const { data, error } = await supabase
                    .from('messages')
                    .select('*, sender_id(*), receiver_id(*)')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Group by conversation partner
                const map = new Map();
                if (data) {
                    data.forEach(msg => {
                        const partnerId = msg.sender_id?.id === user.id ? msg.receiver_id?.id : msg.sender_id?.id;
                        const partnerProfile = msg.sender_id?.id === user.id ? msg.receiver_id : msg.sender_id;

                        // Ignore if partner data is missing or corrupted
                        if (!partnerId || !partnerProfile) return;

                        if (!map.has(partnerId)) {
                            map.set(partnerId, {
                                partner: partnerProfile,
                                latestMessage: msg.content,
                                gigId: msg.gig_id,
                                time: msg.created_at,
                                isUnread: msg.receiver_id?.id === user.id // simplistic naive unread display
                            });
                        }
                    });
                }

                setConversations(Array.from(map.values()));
            } catch (error) {
                console.error(error);
                toast.error('Failed to load messages');
            } finally {
                setLoading(false);
            }
        };
        fetchInbox();
    }, [user]);

    if (loading) return <div className="text-center py-20 font-bold text-slate-500">Loading your inbox...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 min-h-[calc(100vh-4rem)]">
            <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center">
                <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
                Your Inbox
            </h1>

            {conversations.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 p-12 text-center rounded-3xl">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-800 text-xl">No Messages Yet</h3>
                    <p className="text-slate-500 mt-2">When you contact a provider or receive an offer, it will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {conversations.map((conv, idx) => (
                        <Link to={`/chat?user=${conv.partner.id}${conv.gigId ? `&gig=${conv.gigId}` : ''}`} key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center group">
                            <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden mr-5 flex-shrink-0 border border-slate-200 shadow-inner">
                                {conv.partner.profilePicture ?
                                    <img src={conv.partner.profilePicture} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-lg">{conv.partner.name?.charAt(0)}</div>}
                            </div>
                            <div className="flex-grow min-w-0 pr-4">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-black text-lg text-slate-800 truncate group-hover:text-blue-600 transition">{conv.partner.name}</h3>
                                </div>
                                <p className={`truncate text-base ${conv.isUnread ? 'font-bold text-slate-800' : 'text-slate-500 font-medium'}`}>
                                    {conv.latestMessage}
                                </p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <span className="text-xs font-bold text-slate-400 block mb-2">{new Date(conv.time).toLocaleDateString()}</span>
                                {conv.isUnread && <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-sm"></span>}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InboxPage;
