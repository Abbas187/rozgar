import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Search, MapPin, DollarSign, Briefcase } from 'lucide-react';
import dayjs from 'dayjs';

const BrowseJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                const mappedJobs = data.map(job => ({ ...job, _id: job.id, createdAt: job.created_at }));
                setJobs(mappedJobs);
            } catch (error) {
                console.error('Failed to load jobs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Browse Available Jobs</h1>
                <p className="text-slate-600 mt-2">Find the right task for your skills and apply today.</p>
            </div>

            <div className="relative mb-8 max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="input-field pl-10 py-3 text-lg shadow-sm"
                    placeholder="Search by keyword, category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-lg text-slate-600 font-medium">No open jobs found matching "{searchTerm}"</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div key={job._id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between group hover:border-primary-200">
                                <div className="flex-grow">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-primary-100">
                                            {job.category}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            Posted • {dayjs(job.createdAt).format('MMM D, YYYY')}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                                        {job.title}
                                    </h3>
                                    <p className="text-slate-500 mt-2 line-clamp-2 max-w-3xl">
                                        {job.description}
                                    </p>

                                    <div className="flex items-center space-x-6 mt-4 opacity-80">
                                        <div className="flex items-center text-sm font-medium text-slate-700">
                                            <DollarSign className="w-4 h-4 mr-1 text-emerald-600" />
                                            Budget: ${job.budget}
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-slate-700">
                                            <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                                            {job.location || 'Remote'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0 flex flex-col items-center">
                                    <Link to={`/jobs/${job._id}`} className="btn-primary w-full md:w-auto mt-2 whitespace-nowrap">
                                        View & Apply
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BrowseJobsPage;
