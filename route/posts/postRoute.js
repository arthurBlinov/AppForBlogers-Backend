const express = require('express');
const {createPostCtrl, 
    fetchPostsCtrl, 
    fetchPostCtrl, 
    updatePostCtrl, 
    deletePostCtrl,
    toggleAddLikeToPostCtrl,
    toggleAddDislikeToPostCtrl} = require('../../controllers/posts/postController');
const authMiddleware = require('../../midlleware/auth/authMiddleware');
const {photoUpload, postImageResize}  = require('../../midlleware/uploads/photoUpload');
const postRoute = express.Router();
postRoute.put('/likes', authMiddleware, toggleAddLikeToPostCtrl)
postRoute.put('/dislikes', authMiddleware, toggleAddDislikeToPostCtrl);
postRoute.post('/', authMiddleware, photoUpload.single('image'), postImageResize, createPostCtrl);
postRoute.get('/', fetchPostsCtrl);
postRoute.get('/:id', fetchPostCtrl);
postRoute.put('/:id', authMiddleware, updatePostCtrl);
postRoute.delete('/:id', deletePostCtrl);
module.exports = postRoute;

