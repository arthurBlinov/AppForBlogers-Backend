const mongoose = require('mongoose');
//database connection
const dbConnect = async() => {
    
    try {
        
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Db is Connected Succesfully');
    } catch (error) {
        console.log(`Error ${error.message}`);
    }
}
module.exports = dbConnect;