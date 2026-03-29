import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Zap, Users } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="bg-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white pt-24 pb-32">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop')] bg-cover bg-center opacity-5"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto animate-slide-up">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
                            Find the perfect <span className="text-primary-600">professional</span> for your task
                        </h1>
                        <p className="text-xl text-slate-600 mb-10">
                            Connect with skilled individuals in your area. Safe payments, real-time chat, and guaranteed satisfaction.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link to="/register?role=Buyer" className="btn-primary text-lg px-8 py-3">
                                Post a Job
                            </Link>
                            <Link to="/register?role=Provider" className="btn-secondary text-lg px-8 py-3 bg-white border-2 border-slate-200">
                                Become a Provider
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Why choose PeerServe?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Escrow Payments</h3>
                            <p className="text-slate-600">Funds are held safely until the job is completed and approved by you.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Matching</h3>
                            <p className="text-slate-600">Find the right talent in minutes, chat instantly, and get your tasks done faster.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Professionals</h3>
                            <p className="text-slate-600">Check reviews, ratings, and past completed jobs before hiring anyone.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
