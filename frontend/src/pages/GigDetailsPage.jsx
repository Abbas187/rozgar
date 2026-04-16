import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/useAuthStore';
import { Star, Shield, Check, Clock, MessageSquare, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const GigDetailsPage = () => {
    const { id } = useParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [gig, setGig] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchGigData = async () => {
        try {
            const { data: gigData, error: gigError } = await supabase
                .from('gigs')
                .select('*, provider_id(*)')
                .eq('id', id)
                .single();

            if (gigError) throw gigError;
            setGig(gigData);

            const { data: reviewsData, error: reviewsError } = await supabase
                .from('gig_reviews')
                .select('*, buyer_id(*)')
                .eq('gig_id', id)
                .order('created_at', { ascending: false });

            if (!reviewsError) {
                setReviews(reviewsData || []);
            }
        } catch (error) {
            console.error('Gig fetch error:', error);
            toast.error('Failed to load gig details.');
            navigate('/browse-gigs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGigData();
    }, [id]);

    const handleContactProvider = () => {
        if (!user) {
            toast.error('Please log in first.');
            navigate('/login');
            return;
        }
        if (gig.provider_id.id === user.id) {
            toast.error('You cannot chat with yourself!');
            return;
        }
        navigate(`/chat?user=${gig.provider_id.id}&gig=${gig.id}`);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const { error } = await supabase.from('gig_reviews').insert([{
                gig_id: id,
                buyer_id: user.id,
                rating: rating,
                comment: comment
            }]);

            if (error) throw error;
            toast.success('Review submitted successfully!');
            setShowReviewForm(false);
            setComment('');
            setRating(5);
            fetchGigData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit review.');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="text-center py-32 text-blue-600 font-bold text-xl">Loading gig details...</div>;
    if (!gig) return null;

    const avgRating = reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 0;

    return (
        <div className="bg-slate-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-sm text-slate-500 mb-6 font-medium">
                    <Link to="/browse-gigs" className="hover:text-blue-600 font-bold hover:underline transition">Marketplace</Link> <span className="mx-2 text-slate-300">/</span>
                    <span className="text-slate-800">{gig.category}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-grow space-y-8">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider rounded-lg mb-4">
                                {gig.category}
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-6">
                                {gig.title}
                            </h1>

                            <div className="flex items-center space-x-6 text-sm font-bold border-b border-slate-100 pb-6 mb-6">
                                <div className="flex items-center text-slate-700">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 mr-3 border border-slate-200">
                                        {gig.provider_id?.profilePicture ?
                                            <img src={gig.provider_id.profilePicture} className="w-full h-full object-cover" alt="" />
                                            : <div className="w-full h-full flex items-center justify-center text-slate-500">{gig.provider_id?.name?.charAt(0)}</div>
                                        }
                                    </div>
                                    <span className="hover:text-blue-600 transition cursor-pointer">{gig.provider_id?.name || 'Unknown User'}</span>
                                </div>
                                <div className="flex items-center text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                    <Star className="w-4 h-4 mr-1.5 fill-amber-500" />
                                    <span className="text-base">{avgRating}</span>
                                    <span className="text-amber-700 ml-1.5 font-semibold">({reviews.length})</span>
                                </div>
                            </div>

                            <div className="h-80 sm:h-[450px] w-full rounded-2xl overflow-hidden relative mb-10 shadow-inner">
                                <img src={
                                    gig.category.includes('Plumbing') ? 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=1200&auto=format&fit=crop' :
                                        gig.category.includes('Construct') ? 'https://images.unsplash.com/photo-1504307651254-35680f356fce?q=80&w=1200&auto=format&fit=crop' :
                                            gig.category.includes('Painting') ? 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop' :
                                                'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop'
                                } alt="Gig Cover" className="w-full h-full object-cover object-center" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white text-sm font-black uppercase tracking-widest bg-black/40 backdrop-blur px-4 py-2 rounded-lg border border-white/20 shadow-lg">
                                    {gig.experience_level} LEVEL
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 mb-4">About this Gig</h2>
                            <div className="prose max-w-none text-slate-600 bg-slate-50 p-6 rounded-2xl whitespace-pre-wrap leading-relaxed border border-slate-100 font-medium text-base">
                                {gig.description}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center">
                                    <MessageSquare className="w-6 h-6 mr-3 text-blue-500" />
                                    Client Reviews
                                </h2>
                                {user && user.role === 'Buyer' && !showReviewForm && (
                                    <button onClick={() => setShowReviewForm(true)} className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition shadow-sm border border-blue-100">
                                        Write a Review
                                    </button>
                                )}
                            </div>

                            {showReviewForm && (
                                <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-2xl border-2 border-blue-100 mb-8 animate-fade-in shadow-xl shadow-blue-900/5">
                                    <h3 className="font-black text-slate-800 mb-4 text-lg">Leave your rating & feedback</h3>
                                    <div className="flex items-center space-x-2 mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-flex">
                                        <span className="text-sm font-bold text-slate-700 mr-2">Rating:</span>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className={`w-6 h-6 cursor-pointer transition-colors hover:scale-110 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} onClick={() => setRating(star)} />
                                        ))}
                                    </div>
                                    <textarea rows="3" className="input-field py-3 bg-slate-50 focus:bg-white mb-5 resize-none text-slate-700 font-medium" placeholder="Describe your experience working with this provider..." value={comment} onChange={e => setComment(e.target.value)} required></textarea>
                                    <div className="flex justify-end space-x-3">
                                        <button type="button" onClick={() => setShowReviewForm(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition">Cancel</button>
                                        <button type="submit" disabled={submittingReview} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-md transition">{submittingReview ? 'Submitting...' : 'Post Review'}</button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-bold">No reviews found for this gig yet.</p>
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="flex space-x-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-slate-100 shadow-sm flex-shrink-0">
                                                {review.buyer_id?.profilePicture ?
                                                    <img src={review.buyer_id.profilePicture} className="w-full h-full object-cover" alt="" />
                                                    : <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 font-black">{review.buyer_id?.name?.charAt(0)}</div>
                                                }
                                            </div>
                                            <div className="flex-grow pt-1">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="font-black text-slate-800 text-base">{review.buyer_id?.name || 'Anonymous User'}</span>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(review.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex text-amber-400 mb-3">
                                                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}
                                                </div>
                                                <p className="text-slate-600 text-sm font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{review.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-[400px] flex-shrink-0 space-y-6 relative">
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200 sticky top-24">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-6">
                                <h3 className="text-xl font-black text-slate-800">Secure Purchase</h3>
                                <div className="text-3xl font-black text-slate-900">${gig.price}</div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start text-sm text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <Clock className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                                    Fast professional delivery timeline.
                                </li>
                                <li className="flex items-start text-sm text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <Briefcase className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                                    {gig.experience_level} quality assurance.
                                </li>
                                <li className="flex items-start text-sm text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <Check className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                                    Dedicated support during contract.
                                </li>
                            </ul>

                            <button
                                onClick={handleContactProvider}
                                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-lg font-black tracking-wide py-4 mx-auto rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform mb-4 flex justify-center items-center"
                            >
                                Contact to Request (${gig.price})
                            </button>

                            <p className="text-center text-xs font-bold text-slate-400 flex items-center justify-center uppercase tracking-widest mt-6">
                                <Shield className="w-4 h-4 mr-1.5" /> Buyer Escrow Protection
                            </p>
                        </div>

                        <div className="bg-gradient-to-b from-slate-100 to-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
                            <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-white border-4 border-white shadow-xl mb-5">
                                {gig.provider_id?.profilePicture ?
                                    <img src={gig.provider_id.profilePicture} className="w-full h-full object-cover" alt="" />
                                    : <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300 font-black">{gig.provider_id?.name?.charAt(0)}</div>
                                }
                            </div>
                            <h4 className="font-black text-xl text-slate-900">{gig.provider_id?.name}</h4>
                            <p className="text-sm font-black text-blue-600 mb-6 uppercase tracking-widest">{gig.provider_id?.location || 'Global Provider'}</p>

                            <button onClick={handleContactProvider} className="inline-block px-8 py-3 border-2 border-slate-200 text-slate-700 font-black rounded-xl text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition shadow-sm w-full">
                                Message Me
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GigDetailsPage;
