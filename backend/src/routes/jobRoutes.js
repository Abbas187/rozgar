const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getJobById,
    getMyJobs,
    applyToJob,
    getJobApplications,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getJobs).post(protect, createJob);
router.route('/myjobs').get(protect, getMyJobs);
router.route('/:id').get(getJobById);
router.route('/:id/apply').post(protect, applyToJob);
router.route('/:id/applications').get(protect, getJobApplications);

module.exports = router;
