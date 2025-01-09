const { generateToken } = require('../config/jwToken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

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
    if (findUser && await findUser.isPasswordMatched(password)) {
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?.id),
        })
    } else {
        throw new Error("Invalid Credentials");
    }
});


// Get all users

const getallUser = asyncHandler( async(req, res) => {
   try {
    const getUsers = await User.find();
    res.json(getUsers);
   }
   catch (error) {
    throw new Error(error);
   }
});


// Get a single user

const getsingleUser = asyncHandler( async(req, res) => {
    const {id} = req.params;
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



module.exports = {createUser, loginUserCtrl, getallUser, getsingleUser, deleteUser};