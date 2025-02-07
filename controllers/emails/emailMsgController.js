const expressAsyncHandler = require('express-async-handler');
const sgMail = require('@sendgrid/mail');
const Filter = require('bad-words');
const EmailMsg = require('../../model/emailMessaging/EmailMessaging');


const sendEmailMsgCtrl = expressAsyncHandler(async(req,res) => {
    const {to, subject, message} = req?.body;
    const emailMessage = subject + ' ' + message;
    const filter = new Filter();
    const isProfane = filter.isProfane(emailMessage);
    if(isProfane) throw new Error ('Email sent failed, because it contains bad words');
    try {
        //build up message
        const msg = {
            to, subject, 
            text: message,
            from: 'blinov.arthur.2023@gmail.com' 
        }
        //send msg
        await sgMail.send(msg);
        //save to our db
        await EmailMsg.create({
            sentBy: req?.user?._id,
            from: req?.user?.email,
            to, subject, message
        })
        res.json('Mail sent'); 
    } catch (error) {
        res.json(error);
    }
})

module.exports = {sendEmailMsgCtrl};