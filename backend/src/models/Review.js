const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Order',
        },
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        revieweeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
