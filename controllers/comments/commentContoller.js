const expressAsyncHandler = require('express-async-handler');
const Comment = require('../../model/comment/Comment');
const blockUser = require('../../utils/blockUser');
const validateMongodbId = require('../../utils/validateMongodbID');

const createCommentCtrl = expressAsyncHandler(async(req,res) => {
    //get the user
    const user = req.user
    //check if user is blocked
    blockUser(user)
    //get the post id 
    const {postId, description} = req.body;
    try {
        const comment = await Comment.create({
            post: postId,
            user,
            description 
        });
        res.json(comment)
    } catch (error) {
        
        res.json(error)
    }
})

//fetch all comments
const fetchAllComments = expressAsyncHandler(async (req,res) => {
    try {
        const comments = await Comment.find({}).sort('-created');
        res.json(comments);
        return ;
    } catch (error) {
        res.json(error);
    }
})
//comment details
const fetchSingleCommentCtrl = expressAsyncHandler(async(req,res) => {
    const {id} = req.params;
    try {
        const comment = await Comment.findById(id);
        res.json(comment);
        return ;
    } catch (error) {
        res.json(error);
    }
    res.json('single comment');
})
//update comment ctrl 
const updateCommentCtrl = expressAsyncHandler(async (req,res) =>{
    const {id} = req.params;
    try {
        const update = await Comment.findByIdAndUpdate(id, {
            user: req?.user,
            description: req?.body?.description
        }, {
            new: true,
            runValidators: true
        })
        res.json(update);
        return ;
    } catch (error) {
        res.json(error);
    }
    res.json('update');
})
//delete comment
const deleteCommentCtrl = expressAsyncHandler(async(req,res) => {
    const {id} = req.params;
    validateMongodbId(id);
    try {
        const comment = await Comment.findByIdAndDelete(id);
        res.json(comment);
    } catch (error) {
        res.json(error)
    }
    res.json('delete')
})

module.exports = {createCommentCtrl, 
    fetchAllComments, 
    fetchSingleCommentCtrl,
    updateCommentCtrl,
    deleteCommentCtrl};
