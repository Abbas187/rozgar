const User = require('../models/User');
const Job = require('../models/Job');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all jobs
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({}).populate('buyerId', 'name');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('jobId', 'title')
            .populate('buyerId', 'name')
            .populate('providerId', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resolve a dispute
// @route   PUT /api/admin/dispute/:orderId
// @access  Private (Admin)
const resolveDispute = async (req, res) => {
    try {
        const { action } = req.body; // 'RefundBuyer' or 'ReleaseToProvider'
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'Dispute') {
            return res.status(400).json({ message: 'Order is not in dispute' });
        }

        if (action === 'RefundBuyer') {
            const buyer = await User.findById(order.buyerId);
            buyer.walletBalance += order.amount;
            await buyer.save();
            order.paymentStatus = 'Refunded';
            order.status = 'Cancelled';
        } else if (action === 'ReleaseToProvider') {
            const provider = await User.findById(order.providerId);
            provider.walletBalance += order.amount;
            provider.completedJobs += 1;
            await provider.save();
            order.paymentStatus = 'Released';
            order.status = 'Completed';
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers, getJobs, getOrders, resolveDispute };
