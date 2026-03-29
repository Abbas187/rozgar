const Message = require('../models/Message');
const Order = require('../models/Order');

// @desc    Get chat history for an order
// @route   GET /api/chat/:orderId
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (
            order.buyerId.toString() !== req.user._id.toString() &&
            order.providerId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized to view this chat' });
        }

        const messages = await Message.find({ orderId: order._id })
            .populate('senderId', 'name profilePicture')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save a new message
// @route   POST /api/chat/:orderId
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (
            order.buyerId.toString() !== req.user._id.toString() &&
            order.providerId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized to send a message' });
        }

        const receiverId =
            order.buyerId.toString() === req.user._id.toString()
                ? order.providerId
                : order.buyerId;

        const message = new Message({
            orderId: order._id,
            jobId: order.jobId,
            senderId: req.user._id,
            receiverId,
            content,
        });

        const savedMessage = await message.save();

        // Populate sender info before returning
        await savedMessage.populate('senderId', 'name profilePicture');

        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getChatHistory, sendMessage };
