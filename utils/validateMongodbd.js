const mongoose = require('mongoose')
const validateMongoDbId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
        throw new Error("This Id is not valid/not found.");
    }
};

module.exports = validateMongoDbId;