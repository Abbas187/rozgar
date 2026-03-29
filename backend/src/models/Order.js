const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Job',
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Dispute'],
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Held_in_Escrow', 'Released', 'Refunded'],
            default: 'Pending',
        },
        termsAccepted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
