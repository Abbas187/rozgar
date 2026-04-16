import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/useAuthStore';
import { Send, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatPage = () => {
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const targetUserId = searchParams.get('user');
    const gigId = searchParams.get('gig');
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [targetUser, setTargetUser] = useState(null);
    const [relatedGig, setRelatedGig] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user || !targetUserId) return;

        const fetchData = async () => {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
            setTargetUser(profile);

            if (gigId) {
                const { data: gig } = await supabase.from('gigs').select('*').eq('id', gigId).single();
                setRelatedGig(gig);
            }

            const { data: history } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            setMessages(history || []);
        };

        fetchData();

        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                const newMsg = payload.new;
                if ((newMsg.sender_id === user.id && newMsg.receiver_id === targetUserId) ||
                    (newMsg.sender_id === targetUserId && newMsg.receiver_id === user.id)) {
                    setMessages(prev => [...prev, newMsg]);
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
                setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user, targetUserId, gigId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e, isOffer = false) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() && !isOffer) return;

        try {
            await supabase.from('messages').insert([{
                sender_id: user.id,
                receiver_id: targetUserId,
                gig_id: gigId || null,
                content: isOffer ? `FORMAL OFFER: I am ready to accept an order for this Gig.` : newMessage,
                is_offer: isOffer
            }]);
            if (!isOffer) setNewMessage('');
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleAcceptOffer = async (messageId) => {
        try {
            await supabase.from('messages').update({ is_accepted: true }).eq('id', messageId);

            const { data: jobData } = await supabase.from('jobs').insert([{
                title: `${relatedGig?.title || 'Custom Service'}`,
                description: `Created from agreed chat offer.`,
                budget: relatedGig?.price || 0,
                status: 'In Progress',
                buyerId: user.id
            }]).select().single();

            await supabase.from('orders').insert([{
                jobId: jobData.id,
                providerId: targetUserId,
                buyerId: user.id,
                amount: relatedGig?.price || 0,
                status: 'Pending'
            }]);

            toast.success("Offer accepted! Order has been created.");
            navigate('/dashboard');
        } catch (error) {
            toast.error("Failed to accept offer.");
        }
    };

    if (!user || !targetUserId) return <div className="text-center p-20 font-bold text-slate-500">Connecting chat session...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col pt-10">
            <div className="bg-white rounded-t-3xl border border-slate-200 p-6 flex items-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden mr-4 border border-slate-100 shadow-sm">
                    {targetUser?.profilePicture ? <img src={targetUser.profilePicture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-lg">{targetUser?.name?.charAt(0)}</div>}
                </div>
                <div>
                    <h2 className="font-black text-slate-800 text-xl">{targetUser?.name || 'Loading...'}</h2>
                    {relatedGig && <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">Gig Context: {relatedGig.title}</p>}
                </div>
            </div>

            <div className="flex-grow bg-slate-50 border-x border-slate-200 p-6 overflow-y-auto flex flex-col space-y-5 shadow-inner">
                {messages.length === 0 && <div className="text-center m-auto text-slate-400 font-bold bg-white px-6 py-4 rounded-full shadow-sm border border-slate-100">Say hello to {targetUser?.name}! Start discussing your project.</div>}

                {messages.map(msg => {
                    const isMine = msg.sender_id === user.id;
                    if (msg.is_offer) {
                        return (
                            <div key={msg.id} className="mx-auto w-full max-w-md bg-white border-4 border-blue-500 rounded-3xl p-6 shadow-xl text-center my-4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-3 absolute top-6 right-6 opacity-20" />
                                <h4 className="font-black text-blue-900 mb-2 border-b border-blue-100 pb-3 flex justify-center items-center text-xl">
                                    <Check className="w-6 h-6 mr-2 text-blue-600" /> Formal Gig Offer
                                </h4>
                                <p className="text-base font-bold text-slate-600 mb-6 mt-4">The provider is ready to begin work on this project for <span className="text-black bg-blue-100 px-2 py-1 rounded">${relatedGig?.price || '...'}</span>.</p>
                                {msg.is_accepted ?
                                    <div className="text-emerald-800 font-black tracking-widest uppercase bg-emerald-100 border border-emerald-200 px-5 py-3 rounded-xl text-sm inline-flex items-center shadow-inner">
                                        <Check className="w-5 h-5 mr-2 text-emerald-600" /> Handshake Accepted
                                    </div>
                                    : !isMine ?
                                        <button onClick={() => handleAcceptOffer(msg.id)} className="w-full bg-blue-600 text-white font-black hover:-translate-y-1 py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/30">Accept & Fund Contract</button>
                                        : <div className="text-blue-500 text-sm font-bold bg-blue-50 py-3 rounded-xl border border-blue-100">Waiting for {targetUser?.name} to accept...</div>
                                }
                            </div>
                        );
                    }
                    return (
                        <div key={msg.id} className={`max-w-[80%] rounded-3xl px-5 py-3.5 shadow-sm font-medium ${isMine ? 'self-end bg-blue-600 text-white rounded-br-none' : 'self-start bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                            {msg.content}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white p-5 border border-slate-200 rounded-b-3xl shadow-md">
                {user.role === 'Provider' && relatedGig && (
                    <button onClick={() => handleSendMessage(null, true)} className="mb-4 text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-lg flex items-center transition">
                        <Check className="w-4 h-4 mr-2" /> Send Formal Offer for ${relatedGig.price}
                    </button>
                )}
                <form onSubmit={e => handleSendMessage(e)} className="flex space-x-3">
                    <input type="text" className="flex-grow bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800 transition" placeholder="Type your message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white w-14 rounded-2xl flex items-center justify-center transition hover:shadow-lg">
                        <Send className="w-6 h-6 -ml-1" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
