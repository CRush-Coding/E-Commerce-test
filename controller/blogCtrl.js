const blog = require('../models/blogModels');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbd")

const createBlog = asyncHandler(async(req,res) => {
    

});

module.exports = {createBlog};