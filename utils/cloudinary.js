const cloudinary = require('cloudinary');


cloudinary.config({
    cloud_name: process.env.CLOUD_KEY,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY,
});

const cloudinaryUploadImg = async(fileToUpload) => {
    // console.log(process.env.CLOUD_KEY);
    // console.log(cloudinary.config());
    return new Promise ((resolve) => {
        cloudinary.uploader.upload(fileToUpload, (result) => {
            resolve({
                url:result.secure_url,
                asset_id: result.asset_id,
                public_id:result.public_id,

            }, {
                resource_type:"auto",
            });
        });
    });
};

const cloudinaryDeleteImg = async(fileToDelete) => {
    // console.log(process.env.CLOUD_KEY);
    // console.log(cloudinary.config());
    return new Promise ((resolve) => {
        cloudinary.uploader.destroy(fileToDelete, (result) => {
            resolve({
                url:result.secure_url,
                asset_id: result.asset_id,
                public_id:result.public_id,

            }, {
                resource_type:"auto",
            });
        });
    });
};

module.exports = {cloudinaryUploadImg, cloudinaryDeleteImg};