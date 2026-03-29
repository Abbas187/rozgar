const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'Completed') {
            return res.status(400).json({ message: 'Can only review completed orders' });
        }

        const isBuyer = order.buyerId.toString() === req.user._id.toString();
        const isProvider = order.providerId.toString() === req.user._id.toString();

        if (!isBuyer && !isProvider) {
            return res.status(403).json({ message: 'Not authorized for this order' });
        }

        const revieweeId = isBuyer ? order.providerId : order.buyerId;

        const alreadyReviewed = await Review.findOne({
            orderId: order._id,
            reviewerId: req.user._id,
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Order already reviewed by you' });
        }

        const review = new Review({
            orderId: order._id,
            reviewerId: req.user._id,
            revieweeId,
            rating: Number(rating),
            comment,
        });

        await review.save();

        // Update user's average rating
        const reviews = await Review.find({ revieweeId });
        const numReviews = reviews.length;

        // Safety check in case it's 0 (which shouldn't happen here)
        if (numReviews > 0) {
            const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews;
            const reviewee = await User.findById(revieweeId);
            reviewee.rating = avgRating.toFixed(1);
            await reviewee.save();
        }

        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReview };
