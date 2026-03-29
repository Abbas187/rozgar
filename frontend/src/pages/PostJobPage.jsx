import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'Plumbing', 'Electrical', 'Cleaning',
    'Carpentry', 'Painting', 'Moving',
    'Landscaping', 'Web Development', 'Design', 'Other'
];

const PostJobPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        category: CATEGORIES[0],
        location: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axiosInstance.post('/jobs', {
                ...formData,
                budget: Number(formData.budget)
            });
            toast.success('Job posted successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post job');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Post a New Task</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="input-field"
                            placeholder="e.g. Fix leaking kitchen sink"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            name="category"
                            className="input-field"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            required
                            rows="5"
                            className="input-field resize-none"
                            placeholder="Provide details about what needs to be done..."
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Budget ($)</label>
                            <input
                                type="number"
                                name="budget"
                                required
                                min="5"
                                className="input-field"
                                placeholder="0.00"
                                value={formData.budget}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                required
                                className="input-field"
                                placeholder="City, Neighborhood, etc."
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-secondary mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJobPage;
