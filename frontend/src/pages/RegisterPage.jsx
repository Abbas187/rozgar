import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Briefcase, MapPin } from 'lucide-react';

const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') === 'Provider' ? 'Provider' : 'Buyer';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: initialRole,
        location: '',
    });

    const { register, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password || !formData.role) {
            return toast.error('Please fill all required fields');
        }

        const result = await register(formData);
        if (result && result.success) {
            toast.success('Registration successful!');
            navigate('/dashboard');
        } else {
            toast.error((result && result.message) || 'Failed to register');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">Create an account</h2>
                    <p className="mt-2 text-slate-600">Join our marketplace today.</p>
                </div>

                <div className="bg-white py-8 px-10 shadow-sm rounded-2xl border border-slate-100">
                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                type="button"
                                className={`py-2 px-4 border rounded-xl flex items-center justify-center space-x-2 transition-all ${formData.role === 'Buyer' ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                onClick={() => setFormData({ ...formData, role: 'Buyer' })}
                            >
                                <User className="w-4 h-4" />
                                <span>Buyer</span>
                            </button>
                            <button
                                type="button"
                                className={`py-2 px-4 border rounded-xl flex items-center justify-center space-x-2 transition-all ${formData.role === 'Provider' ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                onClick={() => setFormData({ ...formData, role: 'Provider' })}
                            >
                                <Briefcase className="w-4 h-4" />
                                <span>Provider</span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    className="input-field pl-10 py-2.5"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    className="input-field pl-10 py-2.5"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    className="input-field pl-10 py-2.5"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Location (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    className="input-field pl-10 py-2.5"
                                    placeholder="New York, NY"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 mt-4"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
