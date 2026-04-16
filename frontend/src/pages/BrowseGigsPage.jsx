import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Search, Filter, Star, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const BrowseGigsPage = () => {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const categories = ['All', 'Web Development', 'Graphic Design', 'Writing & Translation', 'Digital Marketing', 'Video & Animation', 'Music & Audio', 'Business', 'Lifestyle'];

    useEffect(() => {
        const fetchGigs = async () => {
            try {
                const { data, error } = await supabase
                    .from('gigs')
                    .select('*, provider_id(*)')
                    .order('created_at', { ascending: false });

                if (error && error.code !== '42P01') throw error;
                setGigs(data || []);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load gigs');
            } finally {
                setLoading(false);
            }
        };
        fetchGigs();
    }, []);

    const filteredGigs = gigs.filter(gig => {
        const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || gig.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || gig.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-4rem)] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Find the perfect Gig, <span className="text-blue-600">right now.</span></h1>
                    <p className="text-lg text-slate-600">Browse thousands of professional services vetted just for you.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 mb-10 flex flex-col md:flex-row gap-4 items-center animate-slide-up">
                    <div className="relative flex-grow w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-slate-900 text-lg font-medium"
                            placeholder="What service are you looking for?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-slate-400" />
                        </div>
                        <select
                            className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none font-bold text-slate-700"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-32 text-blue-600 font-bold text-xl">Searching marketplace...</div>
                ) : (
                    <>
                        <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
                            <h2 className="text-2xl font-black text-slate-800">{filteredGigs.length} Services Available</h2>
                        </div>

                        {filteredGigs.length === 0 ? (
                            <div className="text-center bg-white py-32 rounded-3xl border border-slate-200 shadow-sm">
                                <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-slate-400">No gigs found.</h3>
                                <p className="text-slate-500 mt-2 font-medium">Try adjusting your search criteria or categories.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredGigs.map(gig => (
                                    <Link to={`/gigs/${gig.id}`} key={gig.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full">
                                        <div className="h-44 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden flex-shrink-0">
                                            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&auto=format&fit=crop')] bg-cover mix-blend-overlay"></div>
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-blue-900 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-wider shadow-sm">
                                                {gig.experience_level}
                                            </div>
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex items-center space-x-3 mb-4 border-b border-slate-50 pb-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                                                    {gig.provider_id?.profilePicture ?
                                                        <img src={gig.provider_id.profilePicture} alt="provider" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-black leading-none">{gig.provider_id?.name?.charAt(0) || '?'}</div>
                                                    }
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 truncate">{gig.provider_id?.name || 'Unknown Provider'}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-3">
                                                {gig.title}
                                            </h3>
                                            <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">{gig.category}</div>
                                                <div className="text-xl font-black text-slate-900">
                                                    <span className="text-xs text-slate-400 font-bold mr-1.5">STARTING AT</span>
                                                    ${gig.price}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BrowseGigsPage;
