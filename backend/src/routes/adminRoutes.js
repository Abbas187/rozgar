const express = require('express');
const router = express.Router();
const { getUsers, getJobs, getOrders, resolveDispute } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/users').get(protect, admin, getUsers);
router.route('/jobs').get(protect, admin, getJobs);
router.route('/orders').get(protect, admin, getOrders);
router.route('/dispute/:orderId').put(protect, admin, resolveDispute);

module.exports = router;
