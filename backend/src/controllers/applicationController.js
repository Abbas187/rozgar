const Application = require('../models/Application');
const Job = require('../models/Job');
const Order = require('../models/Order');

// @desc    Accept an application
// @route   PUT /api/applications/:id/accept
// @access  Private (Buyer)
const acceptApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const job = await Job.findById(application.jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to accept this application' });
        }

        if (job.status !== 'Open') {
            return res.status(400).json({ message: 'Job is already assigned or closed' });
        }

        // Update application status
        application.status = 'Accepted';
        await application.save();

        // Reject other pending applications for this job
        await Application.updateMany(
            { jobId: job._id, _id: { $ne: application._id }, status: 'Pending' },
            { $set: { status: 'Rejected' } }
        );

        // Update job status
        job.status = 'In Progress';
        job.assignedProviderId = application.providerId;
        await job.save();

        // Create a new Order based on accepted application
        const order = new Order({
            jobId: job._id,
            buyerId: job.buyerId,
            providerId: application.providerId,
            amount: application.proposedPrice,
            status: 'Pending',
            paymentStatus: 'Pending',
        });

        const createdOrder = await order.save();

        res.json({ application, order: createdOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { acceptApplication };
