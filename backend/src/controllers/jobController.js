const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Buyer)
const createJob = async (req, res) => {
    const { title, description, budget, location, category } = req.body;

    if (req.user.role !== 'Buyer') {
        return res.status(403).json({ message: 'Only buyers can post jobs' });
    }

    try {
        const job = new Job({
            buyerId: req.user._id,
            title,
            description,
            budget,
            location,
            category,
        });

        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all jobs (Open)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    const keyword = req.query.keyword
        ? {
            title: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const category = req.query.category ? { category: req.query.category } : {};

    try {
        const jobs = await Job.find({ ...keyword, ...category, status: 'Open' })
            .populate('buyerId', 'name profilePicture rating')
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('buyerId', 'name profilePicture rating location');

        if (job) {
            res.json(job);
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get jobs posted by the logged-in buyer
// @route   GET /api/jobs/myjobs
// @access  Private (Buyer)
const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Provider)
const applyToJob = async (req, res) => {
    const { coverLetter, proposedPrice } = req.body;

    if (req.user.role !== 'Provider') {
        return res.status(403).json({ message: 'Only providers can apply to jobs' });
    }

    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.status !== 'Open') {
            return res.status(400).json({ message: 'Job is not open for new applications' });
        }

        const applicationExists = await Application.findOne({
            jobId: job._id,
            providerId: req.user._id,
        });

        if (applicationExists) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        const application = new Application({
            jobId: job._id,
            providerId: req.user._id,
            coverLetter,
            proposedPrice,
        });

        const createdApplication = await application.save();
        res.status(201).json(createdApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get applications for a job
// @route   GET /api/jobs/:id/applications
// @access  Private (Buyer)
const getJobApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view these applications' });
        }

        const applications = await Application.find({ jobId: job._id }).populate(
            'providerId',
            'name profilePicture skills rating'
        );
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    getMyJobs,
    applyToJob,
    getJobApplications,
};
