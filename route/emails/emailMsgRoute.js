const express = require('express');
const { sendEmailMsgCtrl } = require('../../controllers/emails/emailMsgController');
const authMiddleware = require('../../midlleware/auth/authMiddleware');

const emailRoute = express.Router();

emailRoute.post('/send-email', authMiddleware, sendEmailMsgCtrl);

module.exports = emailRoute;