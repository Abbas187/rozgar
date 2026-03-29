const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        budget: {
            type: Number,
            required: true,
        },
        location: {
            type: String,
        },
        category: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
            default: 'Open',
        },
        assignedProviderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
