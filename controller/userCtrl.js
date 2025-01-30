const { generateToken } = require('../config/jwToken');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const uniqid = require('uniqid')

const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbd');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require("jsonwebtoken");
const sendEmail = require('./emailCtrl');
const crypto = require('crypto');
const { log } = require('console');



const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email: email});

    if (!findUser) {
        // Create a new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        // User already created
        throw new Error('User Already Exists');
    }
});

const loginUserCtrl = asyncHandler( async(req, res) => {
    const {email, password} = req.body;
    // Check if user exists or not
    const findUser = await User.findOne({email});
    console.log(findUser?.id);
    console.log(findUser?._id);
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);

        // console.log(findUser?.id)
        const updateUser = await User.findByIdAndUpdate(findUser.id, {
            refreshToken: refreshToken,
        },
        {now: true}
        
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });

        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?.id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});

// admin login

const loginAdmin = asyncHandler( async(req, res) => {
    const {email, password} = req.body;
    // Check if user exists or not
    const findAdmin = await User.findOne({email});
    console.log(findAdmin?.id);
    console.log(findAdmin?._id);
    if(findAdmin.role !== 'admin') throw new Error("Not Authorized");
    if (findAdmin && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);

        // console.log(findAdmin?.id)
        const updateUser = await User.findByIdAndUpdate(findAdmin.id, {
            refreshToken: refreshToken,
        },
        {now: true}
        
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });

        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?.id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});

// Handle process of generating new access-token from refresh-token

const handleRefreshToken = asyncHandler( async(req, res) => {
    // Get ref-token from cookies
    const cookie = req.cookies;
    // console.log(cookie);
    if (!cookie?.refreshToken) 
        throw new Error('No Refresh Token in Cookies');

    // Check token for debugging purposes
    const refreshToken = cookie.refreshToken;
    // console.log(refreshToken);

    // Get user associated with refresh-token
    const user = await User.findOne({refreshToken});

    // Verify validity of both user and ref-token
    if(!user) throw new Error("No refresh token present in db or not matched.");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        // Check if token is bad or user does not match.
        if (err || user.id !== decoded.id) {
             throw new Error("There is something wrong with your refresh token");
        }
        else {
            // Generate new acc-token
            const accessToken = generateToken(user?._id);
            res.json({accessToken});
        }
    });
    // res.json(user);
    
});

// Handle logout Functionality

const logout = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) 
        throw new Error('No Refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    console.log(user);
    if(!user) {
        res.clearCookie("refreshToken", {
            httpOnly:true,
            secure:true,
        });
        return res.sendStatus(204); //Forbidden
    }

    await User.findOneAndUpdate(user, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly:true,
        secure:true,
    });
    return res.sendStatus(204); //Forbidden
});


// Get all users

const getallUser = asyncHandler( async(req, res) => {
   try {
    // console.log("Here")
    const getUsers = await User.find();
    // For specific searching, e.g. first-name
    // const getUsers = await User.find({}, {firstname:1});
    // console.log(getUsers);
    res.json(getUsers);
   }
   catch (error) {
    throw new Error(error);
   }
});


// Get a single user

const getsingleUser = asyncHandler( async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const getsingleUser = await User.findById(id);
        res.json({
            getsingleUser,
        });
    }
    catch (error) {
        throw new Error(error);
    }
});

const deleteUser = asyncHandler( async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deleteUser = await User.findByIdAndDelete(id);
        res.json({
            deleteUser,
        });
    }
    catch (error) {
        throw new Error(error);
    }
});

// Update a user

const updatedUser = asyncHandler( async(req,res) => {
    const {id} = req.user;
    validateMongoDbId(id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id, {
            firstname:req?.body.firstname,
            lastname:req?.body.lastname,
            email:req?.body.email,
            mobile:req?.body.mobile
        },
        {
            new: true,
        }
        );
        res.json(updatedUser);
    }
    catch(error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler( async(req, res, next) => {
    const {id} = req.user;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );
        // next(block);
        // console.log(block);
        res.json(block);
    }
    catch (error){
        throw new Error(error)
    }
});

const unblockUser = asyncHandler( async(req, res) => {
    const {id} = req.user;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        );
        // console.log(block);
        res.json(block);
    }
    catch (error){
        throw new Error(error)
    }
});

const updatePassword = asyncHandler(async(req,res) => {
    const { _id } = req.user;
    // console.log(_id);
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    // console.log(user);
    if (password) {
        console.log(user.password);
        console.log(password);
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async(req,res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if (!user) throw new Error('This combination does not exist');
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset your password! This link is valid till 10 minutes from now. <a href='https://localhost:5000/api/user/reset-password/${token}'>Click Here</a>`;
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            html: resetURL,
        }
        
        // console.log(data);
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async(req,res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{ $gt: Date.now() }
    });
    if (!user) throw new Error("Token Expired, wooo woooo!");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

const saveAddress = asyncHandler(async(req,res) => {
    const { id } = req.user;
    validateMongoDbId(id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id, {
            address:req?.body.address,
        },
        {
            new: true,
        }
        );
        res.json(updatedUser);
    }
    catch(error) {
        throw new Error(error);
    }
})


const getWishlist = asyncHandler(async(req,res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);

    } catch(error) {
        throw new Error(error);
    }
});

const userCart = asyncHandler(async(req, res) => {
    const {cart} = req.body;
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        let products = [];
        const user = await User.findById(_id);
        // Check if user already has products in cart
        const alreadyExistCart = await Cart.findOne({ orderby:user._id });

        if(alreadyExistCart) {
            console.log(alreadyExistCart);
            Cart.deleteOne({ orderby:user._id });
        }
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select('price').exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        };
        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,
        }).save();
        res.json(newCart);
    } catch (error) {
        throw new Error(error);
    }
});

const getUserCart = asyncHandler(async(req,res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const cart = await Cart.findOne({orderby:_id}).populate(
            'products.product');
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

const emptyCart = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const user = await User.findById(_id);
        const cart = await Cart.findOneAndDelete({orderby: user._id});
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

const applyCoupon = asyncHandler(async(req,res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    const {coupon} = req.body;
    const validCoupon = await Coupon.findOne({name:coupon});
    if(validCoupon == null) {
        throw new Error("Invalid Coupon");
    }
    const user = await User.findById(_id);
    let {products, cartTotal} = await Cart.findOne({orderby:user._id}).populate("products.product");
    let totalAfterDiscout = (cartTotal - (cartTotal * validCoupon.discount/100)).toFixed(2);
    await Cart.findOneAndUpdate({orderby:user._id}, {totalAfterDiscout}, {new:true});
    res.json(totalAfterDiscout);
});

const createOrder = asyncHandler(async(req,res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    const {COD, couponApplied} = req.body;
    try {
        if(!COD) throw new Error('Create cash order failed');
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({orderby:user._id});
        let finalAmount = 0;
        if(couponApplied && userCart.totalAfterDiscout) {
            finalAmount = userCart.totalAfterDiscout;
        } else {
            finalAmount = userCart.cartTotal;
        }

        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "usd",
            },
            orderby:user._id,
            orderStatus:"Cash on Delivery",

        }).save();

        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: {_id:item.product._id},
                    update:{$inc: {quantity: -item.count, sold: +item.count}},
                },
            };
        });
        const updated = await Product.bulkWrite(update, {});
        res.json({message: "success"});

    }   catch (error) {
        throw new Error(error)
    }

});

const getOrders = asyncHandler(async(req,res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const userOrders = await Order.findOne({orderby: _id}).populate('products.product')
        .exec();
        res.json(userOrders);

    } catch (error) {
        throw new Error(error);
    }
});

const updateOrderStatus = asyncHandler(async(req,res) => {
    console.log('am here');
    const {status} = req.body;
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const updateOrder = await Order.findByIdAndUpdate(id, {
            orderStatus: status,
            paymentIntent: {
                status: status,
            },
        }, 
        {new: true}
        );
        res.json(updateOrder);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {createUser, 
    loginUserCtrl, 
    getallUser, 
    getsingleUser, 
    deleteUser, 
    updatedUser, 
    blockUser, 
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
};