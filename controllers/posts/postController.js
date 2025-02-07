const expressAsyncHandler = require("express-async-handler");
const Filter = require('bad-words');
const fs = require('fs');
const Post = require("../../model/post/Post");
const validateMongodbId = require("../../utils/validateMongodbID");
const User = require("../../model/user/User");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const blockUser = require("../../utils/blockUser");

//create post 
const createPostCtrl = expressAsyncHandler(async (req, res) => {
       const {_id} = req.user;
       blockUser(req?.user)
    //check for bad words
    const filter = new Filter();
    const isProfane = filter.isProfane(req?.body?.title, req?.body?.description);
    //Block User
    if(isProfane){
        await User.findByIdAndUpdate(_id, {
            isBlocked: true,
        });
            throw new Error('Creating Failed because it contains profane words and you have been blocked')
    }

    const localPath = `public/images/posts/${req?.file?.filename}`;
    
    //upload to cloudinary
    const imgUpload = await cloudinaryUploadImg(localPath);
    
    try {
        const post = await Post.create({
            image: imgUpload?.url,
            ...req.body,
            title: req.body.title,
            description: req.body.description,
            message: req.body.message,
            user: _id,
           

        });
        res.json(post);
        fs.unlinkSync(localPath);
    } catch (error) {
        res.json(error);
   }
});

//fetch all posts 
const fetchPostsCtrl = expressAsyncHandler(async(req,res) => {
    const hasCategory = req?.query?.category;
    
    try {
        //check if it has category
        if(hasCategory){
            const posts = await Post.find({category: hasCategory}).populate('user')
            .populate('comments').sort('-createdAt');
            // console.log(posts);
            res.json(posts);  
        } else{
            const posts = await Post.find({}).populate('user')
            .populate('comments').sort('-createdAt');
            res.json(posts); 
        }
       
         
    } catch (error) {
        res.json(error);
    }
    
})
//fetch a single post
const fetchPostCtrl = expressAsyncHandler(async (req,res) => {
    const {id} = req.params
    validateMongodbId(id);
    try {
        const post = await Post.findById(id)
        .populate('user')
        .populate('disLikes')
        .populate('likes')
        .populate('comments');;
        //update number of views
        await Post.findByIdAndUpdate(id, {
            $inc:{numViews: 1}
        }, {new: true})
        res.json(post);
    } catch (error) {
        res.json(error);
    }
})
//update post
const updatePostCtrl = expressAsyncHandler(async(req,res) => {
    const {id} = req.params;
    validateMongodbId(id);
    
    try {
        const post = await Post.findByIdAndUpdate(id, {
            ...req.body,
            user: req?.user?._id
        }, {
            new: true,
        }) 
        res.json(post);
        return ;
    } catch (error) {
        res.json(error);
    }
})
//delete post
const deletePostCtrl = expressAsyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongodbId(id);
    try {
        const post = await Post.findByIdAndDelete(id);
        res.json(post);
        return ;
    } catch (error) {
        res.json(error);
    }
    res.json('Delete')
})
//likes
const toggleAddLikeToPostCtrl = expressAsyncHandler(async (req,res) => {
    //find the post to be liked, find the login user
    const {postId} = req.body;
    const post = await Post.findById(postId);
    const loginUserId = req?.user?._id;
    let likesArray = post?.likes;
    let disLikesArray = post?.disLikes;
    let liked;
    let unliked;
    for(i = 0; i < likesArray.length;i++){
            if(likesArray[i].toString() == loginUserId.toString())
                liked = true;
    }
    //check if already liked this post
    for(i = 0; i < disLikesArray.length;i++){
        if(disLikesArray[i].toString() == loginUserId.toString())
            unliked = true;
}
    //remove this user from likes array if he is exists
    if(unliked){
        const updatedPost = await Post.findByIdAndUpdate(postId, {
            $pull: {disLikes: loginUserId},
            disLiked: false
        }, {
            new: true
        })
        res.json(updatedPost);
    }
    //remove this user from dislikes if already disliked
    if(liked){
        const updatedPost = await Post.findByIdAndUpdate(postId, {
            $pull: {likes: loginUserId},
            isLiked: false
        }, {
            new: true
        })
        res.json(updatedPost);
    }else {
        const updatedPost = await Post.findByIdAndUpdate(postId, {
            $push: {likes: loginUserId},
            isLiked: true
        }, {
            new: true
        })
        res.json(updatedPost);
    }
})
//dislikes
const toggleAddDislikeToPostCtrl = expressAsyncHandler(async(req,res) => {
   //find the post to be disliked, find the login user
   const {postId} = req.body;
   const post = await Post.findById(postId);
   const loginUserId = req?.user?._id;
   let likesArray = post?.likes;
    let disLikesArray = post?.disLikes;
    let liked;
    let unliked;
    //check if user has already dislikes
    for(i = 0; i < likesArray.length;i++){
            if(likesArray[i].toString() == loginUserId.toString())
                liked = true;
    }
    //check if already liked this post
    for(i = 0; i < disLikesArray.length;i++){
        if(disLikesArray[i].toString() == loginUserId.toString())
            unliked = true;
}
   //remove this user from likes array if he is exists
   if(liked){
       const updatedPost = await Post.findByIdAndUpdate(postId, {
           $pull: {likes: loginUserId},
           isDisLiked: true
       }, {
           new: true
       })
       res.json(updatedPost);
   }
   //toggling 
   if(unliked){
       const updatedPost = await Post.findByIdAndUpdate(postId, {
           $pull: {disLikes: loginUserId},
           isDisLiked: false
       }, {
           new: true
       })
       res.json(updatedPost);
   }else {
       const updatedPost = await Post.findByIdAndUpdate(postId, {
           $push: {disLikes: loginUserId},
           isDisLiked: false
       }, {
           new: true
       })
       res.json(updatedPost);
   }
   
})
module.exports = {createPostCtrl, 
    fetchPostsCtrl, 
    fetchPostCtrl, 
    updatePostCtrl, 
    deletePostCtrl,
    toggleAddLikeToPostCtrl,
    toggleAddDislikeToPostCtrl};

