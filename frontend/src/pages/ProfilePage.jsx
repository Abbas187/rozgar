import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import { User, Mail, Briefcase, MapPin, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, initialize } = useAuthStore();

    // Local state for edits
    const [name, setName] = useState(user?.name || '');
    const [location, setLocation] = useState(user?.location || '');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ name, location })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Profile updated successfully!');
            await initialize(); // Refresh auth store to sync latest profile data
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage Bucket named 'avatars'
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true, cacheControl: '3600' });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update user profile record
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ profilePicture: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            toast.success('Avatar updated successfully!');
            await initialize(); // Sync

        } catch (error) {
            console.error("Avatar Upload Failed:", error);
            toast.error(error.message || 'Error uploading avatar.');
        } finally {
            setUploading(false);
        }
    };

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
                    {/* Avatar header */}
                    <div className="flex items-center space-x-6 mb-10">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md flex-shrink-0">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-full h-full p-4 text-slate-400" />
                                )}
                            </div>
                            {/* Upload overlay */}
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{uploading ? 'Uploading...' : 'Change'}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
                            </label>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                            <p className="text-slate-500 flex items-center mt-1">
                                <Mail className="w-4 h-4 mr-1.5" />
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1.5" /> Role (Unchangeable)
                                </div>
                                <div className="font-semibold text-slate-900">{user?.role}</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                className="input-field py-2.5"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                                <MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> Location
                            </label>
                            <input
                                type="text"
                                className="input-field py-2.5"
                                value={location}
                                placeholder="E.g. New York, NY"
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex items-center px-6 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm ${user?.role === 'Buyer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
