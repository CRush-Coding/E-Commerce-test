const { generateToken } = require('../config/jwToken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbd');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require("jsonwebtoken");



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
        })
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
            const accessToken = generateRefreshToken(user?._id);
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


module.exports = {createUser, 
    loginUserCtrl, 
    getallUser, 
    getsingleUser, 
    deleteUser, 
    updatedUser, 
    blockUser, 
    unblockUser,
    handleRefreshToken,
    logout
};