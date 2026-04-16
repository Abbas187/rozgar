import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LogOut, User as UserIcon, Briefcase } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                                PeerServe
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 font-medium text-sm transition-colors">
                                    Dashboard
                                </Link>
                                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                                <Link to="/profile" className="flex items-center space-x-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-full h-full p-1 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <span className="text-sm font-bold text-slate-700 block leading-tight">{user.name}</span>
                                        <span className={`text-[10px] uppercase font-black tracking-wider ${user.role === 'Buyer' ? 'text-blue-500' : 'text-emerald-500'}`}>{user.role}</span>
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium text-sm transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
