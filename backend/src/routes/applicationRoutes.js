const express = require('express');
const router = express.Router();
const { acceptApplication } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:id/accept').put(protect, acceptApplication);

module.exports = router;
