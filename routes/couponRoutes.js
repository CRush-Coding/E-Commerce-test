const express = require('express');
const router = express.Router();
const {isAdmin, authMiddleware} = require('../middlewares/authMiddleware');
const { createCoupon, getAllCoupon } = require('../controller/couponCtrl');

router.post('/', authMiddleware, isAdmin, createCoupon);
router.get('/', authMiddleware, isAdmin, getAllCoupon);


module.exports = router;