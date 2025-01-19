const Coupon = require('../models/couponModel');
const validateMongoDbId = require('../utils/validateMongodbd');
const asyncHandler = require ('express-async-handler');

const createCoupon = asyncHandler(async(req,res) => {
    try {
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllCoupon = asyncHandler(async(req,res) => {
    try {
        const allCoupon = await Coupon.find();
        res.json(allCoupon);
    } catch (error) {
        throw new Error(error);
    }
});

const updateCoupon = asyncHandler(async(req,res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {new:true});
        res.json(updatedCoupon);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteCoupon = asyncHandler(async(req,res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const updatedCoupon = await Coupon.findByIdAndDelete(id);
        res.json(updatedCoupon);
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = { createCoupon, getAllCoupon, updateCoupon, deleteCoupon };