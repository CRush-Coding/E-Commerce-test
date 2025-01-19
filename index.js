const express = require('express');
const bodyPaser = require("body-parser");
const dbConnect = require('./config/dbConnect');
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
const blogRouter = require('./routes/blogRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const blogcategoryRouter = require('./routes/blogcatRoutes');
const brandRouter = require('./routes/brandRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

dbConnect();

app.use(morgan());
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({ extended: false }));
app.use(cookieParser());



app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/category', categoryRouter);
app.use('/api/blogcategory', blogcategoryRouter);
app.use('/api/brand',brandRouter);



app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server  is running at PORT ${PORT}`);
})

