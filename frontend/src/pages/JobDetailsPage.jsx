import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { MapPin, DollarSign, Calendar, User, ArrowLeft, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Apply Modal State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [proposedPrice, setProposedPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('*, buyerId:users(*)')
                .eq('id', id)
                .single();

            if (jobError) throw jobError;

            setJob({ ...jobData, _id: jobData.id, createdAt: jobData.created_at, buyerId: { ...jobData.buyerId, _id: jobData.buyerId.id } });

            // If current user is the buyer, fetch applications
            if (user?.id === jobData.buyerId.id) {
                const { data: appsData, error: appsError } = await supabase
                    .from('applications')
                    .select('*, providerId:users(*)')
                    .eq('jobId', id);
                if (!appsError && appsData) {
                    setApplications(appsData.map(app => ({ ...app, _id: app.id, providerId: { ...app.providerId, _id: app.providerId.id } })));
                }
            }
        } catch (error) {
            toast.error('Failed to load job details');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error: applyError } = await supabase.from('applications').insert([{
                jobId: id,
                providerId: user.id,
                coverLetter,
                proposedPrice: Number(proposedPrice),
                status: 'Pending'
            }]);
            if (applyError) throw applyError;
            toast.success('Application submitted successfully!');
            setShowApplyModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcceptApplication = async (appId) => {
        try {
            // update application status
            const { error: appError } = await supabase.from('applications').update({ status: 'Accepted' }).eq('id', appId);
            if (appError) throw appError;

            // create order
            const app = applications.find(a => a._id === appId);
            const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
                jobId: id,
                buyerId: user.id,
                providerId: app.providerId.id,
                amount: app.proposedPrice,
                status: 'Pending',
                paymentStatus: 'Pending'
            }]).select().single();
            if (orderError) throw orderError;

            // update job status
            await supabase.from('jobs').update({ status: 'In Progress', assignedProviderId: app.providerId.id }).eq('id', id);

            toast.success('Provider accepted! An order has been created.');
            navigate(`/orders/${orderData.id}`);
        } catch (error) {
            toast.error(error.message || 'Failed to accept provider');
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500">Loading details...</div>;
    if (!job) return null;

    const isBuyer = user?.id === job.buyerId?._id;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-primary-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <div className="flex items-center space-x-3 mb-3">
                                <span className="bg-primary-50 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full border border-primary-100">
                                    {job.category}
                                </span>
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${job.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    {job.status}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
                        </div>

                        {user?.role === 'Provider' && job.status === 'Open' && (
                            <button
                                onClick={() => setShowApplyModal(true)}
                                className="btn-primary mt-4 md:mt-0 shadow-md"
                            >
                                Apply for this Job
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center text-slate-700">
                                <DollarSign className="w-5 h-5 mr-3 text-emerald-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Budget</p>
                                    <p className="font-semibold">${job.budget}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-slate-700">
                                <MapPin className="w-5 h-5 mr-3 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">Location</p>
                                    <p className="font-semibold">{job.location || 'Remote'}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-slate-700">
                                <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">Posted on</p>
                                    <p className="font-semibold">{dayjs(job.createdAt).format('MMMM D, YYYY')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex items-center">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden mr-4 border border-white shadow-sm">
                                {job.buyerId?.profilePicture ? (
                                    <img src={job.buyerId.profilePicture} alt="Buyer" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-0.5">Posted by</p>
                                <p className="font-bold text-slate-900">{job.buyerId?.name}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Description</h3>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                    </div>
                </div>
            </div>

            {/* Applications Section for Buyer */}
            {isBuyer && applications.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <User className="w-6 h-6 mr-2 text-primary-600" />
                        Applications received ({applications.length})
                    </h2>
                    <div className="space-y-4">
                        {applications.map(app => (
                            <div key={app._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between">
                                <div>
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden mr-3">
                                            {app.providerId?.profilePicture ? (
                                                <img src={app.providerId.profilePicture} alt="Provider" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-slate-400 m-2" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900">{app.providerId?.name}</h4>
                                            <p className="text-xs text-slate-500 font-medium text-emerald-600">Proposed: ${app.proposedPrice}</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 italic text-sm border-l-2 border-slate-200 pl-3">"{app.coverLetter}"</p>
                                </div>

                                <div className="mt-4 md:mt-0 md:ml-6 flex items-center">
                                    {app.status === 'Pending' && job.status === 'Open' ? (
                                        <button
                                            onClick={() => handleAcceptApplication(app._id)}
                                            className="btn-primary flex items-center"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Accept & Hire
                                        </button>
                                    ) : (
                                        <span className={`px-4 py-2 rounded-lg font-medium ${app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {app.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Apply Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Submit Application</h2>
                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Proposed Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="input-field"
                                    value={proposedPrice}
                                    onChange={e => setProposedPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cover Letter</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="input-field max-h-48"
                                    placeholder="Why are you the best fit for this task?"
                                    value={coverLetter}
                                    onChange={e => setCoverLetter(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowApplyModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={submitting} className="btn-primary">
                                    {submitting ? 'Submitting...' : 'Send Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetailsPage;
