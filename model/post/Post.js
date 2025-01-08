const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required:true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Post category is reauired'],
       
    },
    isLiked: {
        type: Boolean,
        default: false
    },
    isDisLiked: {
        type: Boolean,
        default: false
    },
    numViews: {
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        {
            strict: false
        }
    ],
    disLikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please author is required']
    },
    description: {
        type: String,
        required: [true, 'Post description is required']
    },
    image: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2021/12/21/08/29/owl-6884773_960_720.jpg'
    },
}, 
{
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true
});
//populate comment
postSchema.virtual('comments',{
    ref: 'Comment',
    foreignField: 'post',
    localField: '_id',    
})
//compile 
const Post = mongoose.model('Post', postSchema);
module.exports = Post;




