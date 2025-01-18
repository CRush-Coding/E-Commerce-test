const Blog = require('../models/blogModels');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbd")

const createBlog = asyncHandler(async(req,res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);

    } catch (error) {
        throw new Error(error);
    }

});

const updateBlog = asyncHandler(async(req,res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {new: true,});
        res.json(updateBlog);

    } catch (error) {
        throw new Error(error);
    }
});

const getBlog = asyncHandler(async(req,res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const getBlog = await Blog.findById(id);
        const populatedBlog = await getBlog.populate("dislikes");
        const updateViews = 
        await Blog.findByIdAndUpdate(id, {$inc: {numViews: 1},}, {new: true},)
        res.json(populatedBlog);

    } catch (error) {
        throw new Error(error);
    }
});

const getAllBlog = asyncHandler(async(req,res) => {
    try {
        const getBlogs = await Blog.find();
        res.json(getBlogs);

    } catch (error) {
        throw new Error(error);
    }
});

const deleteBlog = asyncHandler(async(req,res) => {
    const {id} = req.params;
    try {
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.json(deleteBlog);

    } catch (error) {
        throw new Error(error);
    }
});

const likeBlog = asyncHandler(async(req,res) => {
    const {id} = req.body;
    console.log('Im here');
    // validateMongoDbId(id);

    // Find the blog you want to be liked
    const blog =  await Blog.findById(id);
    // Find the logged in user
    const loginUserId = req?.user?._id;
    // Find if the user has liked the post
    const isLiked = blog?.isLiked;
    const alreadyDisliked = blog?.dislikes?.find(
        ((userId) => userId?.toString() === loginUserId?.toString())
    );
    if(alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(id, {
            $pull: {dislikes:loginUserId},
            isDisliked:false
        },
        {new: true},
        );
        res.json(blog)
    }
    if(isLiked) {
        const blog = await Blog.findByIdAndUpdate(id, {
            $pull: {likes:loginUserId},
            isLiked:false,
        },
        {new: true},
        );
        res.json(blog)

    } else {
        const blog = await Blog.findByIdAndUpdate(id, {
            $push: {likes:loginUserId},
            isLiked:true,
        },
        {new: true},
        );
        res.json(blog)
    }
});

const dislikeBlog = asyncHandler(async(req,res) => {
    const {id} = req.body;
    console.log('Im here');
    // validateMongoDbId(id);

    // Find the blog you want to be liked
    const blog =  await Blog.findById(id);
    // Find the logged in user
    const loginUserId = req?.user?._id;
    // Find if the user has disliked the post
    const isDisliked = blog?.isDisliked;
    console.log("is-disliked, ", isDisliked);
    const alreadyLiked = blog?.likes?.find(
        ((userId) => userId?.toString() === loginUserId?.toString())
    );
    if(alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(id, {
            $pull: {likes:loginUserId},
            isLiked:false
        },
        {new: true},
        );
        res.json(blog)
    }
    if(isDisliked) {
        const blog = await Blog.findByIdAndUpdate(id, {
            $pull: {dislikes:loginUserId},
            isDisliked:false,
        },
        {new: true},
        );
        res.json(blog)

    } else {
        const blog = await Blog.findByIdAndUpdate(id, {
            $push: {dislikes:loginUserId},
            isDisliked:true,
        },
        {new: true},
        );
        res.json(blog)
    }
});


module.exports = {createBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likeBlog, dislikeBlog};