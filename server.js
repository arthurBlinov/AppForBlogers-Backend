const express = require('express');
const dbConnect = require('./config/db/dbConnect');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./route/users/usersRoute');
const {errorHandler, notFound} = require('./midlleware/error/errorHandler');
const postRoute = require('./route/posts/postRoute');
const commentRoute = require('./route/comments/commentRoute');
const emailRoute = require('./route/emails/emailMsgRoute');
const categoryRoute = require('./route/category/categoryRoute');

const app = express();

dotenv.config();

//Db
dbConnect();

//Middleware
app.use(express.json());

//cors
app.use(cors());

//Users route
app.use('/api/users', userRoutes); 

//Post Route
app.use('/api/posts', postRoute);

//comments route
app.use('/api/comments', commentRoute);

//emails route
app.use('/api/email', emailRoute);

//category route
app.use('/api/category', categoryRoute);

//error handler
app.use(notFound);
app.use(errorHandler)

//server
const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server is running on port ${PORT}`));