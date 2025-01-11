const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");


const authMiddleware = asyncHandler( async(req, res, next) => {
    let token;
    if (req.headers.authorization.startsWith("Bearer")) {
        console.log("yipeeee");
        token = req.headers.authorization.split(" ")[1];
        try {
            if (token) {
                console.log("HOORAYYYYY");
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded?.id);
                req.user = user;
                next();
            }
        }
        catch (error) {
            throw new Error('Not Authorized token expired, please login again');
        }
    } else {
        throw new Error("There is no token attached to header");
    }

});

const isAdmin = asyncHandler( async(req, res, next) => {
    const {email} = req.user;
    // console.log(email);
    const adminUser = await User.findOne({email});
    // console.log(adminUser);
    if (adminUser.role !== "admin") {
        throw new Error("You are not an Admin!");
    } else {
        next();
    }
});

module.exports = {authMiddleware, isAdmin};