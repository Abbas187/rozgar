const Order = require('../models/Order');
const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Get user orders (Buyer & Provider)
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const isBuyer = req.user.role === 'Buyer';
        const query = isBuyer ? { buyerId: req.user._id } : { providerId: req.user._id };

        const orders = await Order.find(query)
            .populate('jobId', 'title description category')
            .populate(isBuyer ? 'providerId' : 'buyerId', 'name profilePicture')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Buyer deposits funds to Escrow
// @route   POST /api/orders/:id/escrow
// @access  Private (Buyer)
const depositToEscrow = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.paymentStatus !== 'Pending') {
            return res.status(400).json({ message: 'Payment is already held or released' });
        }

        const buyer = await User.findById(req.user._id);

        // Mock checking if buyer has enough balance or assume real money payment successful
        // Here we just deduct from mock wallet or assume it was paid via Stripe
        if (buyer.walletBalance < order.amount) {
            // For demo, we auto-fund the wallet
            buyer.walletBalance += order.amount;
        }

        buyer.walletBalance -= order.amount;
        await buyer.save();

        order.paymentStatus = 'Held_in_Escrow';
        order.status = 'In Progress';
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Release Escrow funds to Provider
// @route   POST /api/orders/:id/release
// @access  Private (Buyer)
const releasePayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.paymentStatus !== 'Held_in_Escrow') {
            return res.status(400).json({ message: 'Payment is not in escrow' });
        }

        const provider = await User.findById(order.providerId);
        provider.walletBalance += order.amount;
        provider.completedJobs += 1;
        await provider.save();

        order.paymentStatus = 'Released';
        order.status = 'Completed';
        await order.save();

        const job = await Job.findById(order.jobId);
        if (job) {
            job.status = 'Completed';
            await job.save();
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyOrders, depositToEscrow, releasePayment };
