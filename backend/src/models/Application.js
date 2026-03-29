const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Job',
        },
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        coverLetter: {
            type: String,
            required: true,
        },
        proposedPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
