const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const User = require('../models/userModel');
const { post } = require('../routes/productRoutes');

const createProduct = asyncHandler(async(req, res) => {
    try {
        if (req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);

    } catch (error) {
        throw new Error(error);
    }
});

const updateProduct = asyncHandler(async(req,res) => {
    const {id} = req.params;
    console.log(id);
    try {
        if(req.body.title){
            req.body.slug= slugify(req.body.title);
        };
        const updateProduct= await Product.findByIdAndUpdate(id, req.body, {new:true})
        res.json(updateProduct);
    } catch(error) {
        throw new Error(error);
    }
});

const deleteProduct = asyncHandler(async(req,res) => {
    const {id} = req.params;
    console.log(id);
    try {
        if(req.body.title){
            req.body.slug= slugify(req.body.title);
        };
        const deleteProduct= await Product.findByIdAndDelete(id, req.body, {new:true})
        res.json(deleteProduct);
    } catch(error) {
        throw new Error(error);
    }
});

const getaProduct = asyncHandler(async(req,res) => {
    const {id} = req.params;
    try {
        const findProduct = await Product.findById(id);
        console.log(id);
        res.json(findProduct);
    } catch(error) {
        throw new Error(error);
    }
});

const getAllProduct = asyncHandler(async(req,res) => {
    // console.log(req.query);
    try {

        // Filtering
        const querryObj = {...req.query};
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete querryObj[el]); 
        let queryStr = JSON.stringify(querryObj);
        // console.log(JSON.parse(queryStr));
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        console.log(JSON.parse(queryStr));
        // const query = Product.find(JSON.parse(queryStr));
        let query = Product.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            console.log(sortBy)
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Limiting the fields
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);

        } else {
            query = query.select('-__v');
        }

        // Pagination

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            
            if(skip >= productCount) throw new Error('This page does not exist');
        }
        console.log(page,limit,skip);

        const product = await query;
        // console.log(product);

        const findAllProduct = await Product.find({
            brand: req.query.brand,
            category: req.query.category,
        });
        // console.log(id);
        res.json(product);
    } catch(error) {
        throw new Error(error);
    }
});

const addToWishlist = asyncHandler(async(req,res) => {
    const {_id} = req.user;
    const {prodId} = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyadded = user.wishlist.find((id)=>id.toString() === prodId);
        if (alreadyadded) {
            let user = await User.findByIdAndUpdate(
                _id, 
                {
                $pull: {wishlist: prodId},
                },
                {
                    new: true,
                }
            );
            res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(
                _id, 
                {
                $push: {wishlist: prodId},
                },
                {
                    new: true,
                }
            );
            res.json(user);

        }

    } catch (error) {
        throw new Error(error);
    }
});

const rating = asyncHandler(async(req,res) => {
    const {_id} = req.user;
    const {star, prodId, comment} = req.body;
    const product = await Product.findById(prodId);

    // Check if already rated by user
    try {
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedBy.toString() === _id.toString()
            
        );
        let testingFind = await product.ratings.find((userId) => console.log(userId.postedBy));
        if (alreadyRated){
            const updateRating = await Product.updateOne({
                ratings:{$elemMatch: alreadyRated}, 
            },
            {
                $set:{"ratings.$.star":star, "ratings.$.comment":comment},
            },
            {
                new:true,
            }
            );
    
        } else {
            const rateProduct = await Product.findByIdAndUpdate(prodId, {
                $push: {
                    ratings: {
                        star: star,
                        comment: comment,
                        postedBy: _id,
                    },
                },
            },
            {new: true},
        );
        }
        const getallratings = await Product.findById(prodId);
        let totalRatings = getallratings.ratings.length;
        let ratingsum = getallratings.ratings.map((item) => item.star).reduce((prev,curr) => prev+curr, 0);
        let actualRating = Math.round(ratingsum / totalRatings);
        let finalproduct = await( Product.findByIdAndUpdate(prodId, {
            totalRating: actualRating,
        }, {new:true}
    ));
    res.json(finalproduct);
    } catch (error) {
        throw new Error(error);
    }

});

module.exports = {
    createProduct, 
    getaProduct, 
    getAllProduct, 
    updateProduct, 
    deleteProduct,
    addToWishlist,
    rating
};