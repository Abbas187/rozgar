import React from 'react';
import useAuthStore from '../store/useAuthStore';
import { User, Mail, Briefcase, MapPin } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuthStore();

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-4rem)]">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user?.role === 'Buyer' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {user?.role} Account
                    </span>
                </div>

                <div className="p-8">
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md flex-shrink-0">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-full h-full p-4 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                            <p className="text-slate-500 flex items-center mt-1">
                                <Mail className="w-4 h-4 mr-1.5" />
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <div className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                                <Briefcase className="w-4 h-4 mr-1.5" /> Role
                            </div>
                            <div className="font-semibold text-slate-900">{user?.role}</div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <div className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                                <MapPin className="w-4 h-4 mr-1.5" /> Location
                            </div>
                            <div className="font-semibold text-slate-900">{user?.location || 'Not specified'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
