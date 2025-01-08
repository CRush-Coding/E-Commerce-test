const { default: mongoose } = require("mongoose");

const dbConnect = () => {
    try {
        const connection = mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected");
    }
    catch (error) {
        console.log("Database error");
    }
}

module.exports=dbConnect;