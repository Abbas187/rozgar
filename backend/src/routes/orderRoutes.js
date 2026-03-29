const express = require('express');
const router = express.Router();
const { getMyOrders, depositToEscrow, releasePayment } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMyOrders);
router.route('/:id/escrow').post(protect, depositToEscrow);
router.route('/:id/release').post(protect, releasePayment);

module.exports = router;
