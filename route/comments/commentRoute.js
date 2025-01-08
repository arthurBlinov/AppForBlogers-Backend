const express = require('express');
const { createCommentCtrl, 
    fetchAllComments, 
    fetchSingleCommentCtrl,
    updateCommentCtrl,
    deleteCommentCtrl } = require('../../controllers/comments/commentContoller');
const authMiddleware = require('../../midlleware/auth/authMiddleware');

const commentRoute = express.Router();

commentRoute.post('/', authMiddleware, createCommentCtrl);
commentRoute.get('/', fetchAllComments);
commentRoute.get('/update-comment/:id', authMiddleware, fetchSingleCommentCtrl);
commentRoute.put('/update-comment/:id', authMiddleware, updateCommentCtrl);
commentRoute.delete('/delete/:id', authMiddleware, deleteCommentCtrl);
module.exports = commentRoute;