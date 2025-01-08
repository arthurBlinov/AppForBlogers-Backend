const express = require('express');
const {userRegisterCtrl, 
    loginUserCtrl, 
    fetchUsersCtrl, 
    deleteUsersCtrl, 
    fetchUserDetailsCtrl, 
    userProfileCtrl, 
    updateUserCtrl, 
    updateUserPasswordCtrl, 
    followingUserCtrl, 
    unfollowUserCtrl, 
    blockUserCtrl,
    unBlockUserCtrl,
    generateVerificationTokenControl,
    accountVerificationCtrl,
    forgetPasswordToken,
    passwordResetCtrl, 
    profilePhotoUploadCtrl,
    viewedProfile} = require('../../controllers/users/usersController');
const authMiddleware = require('../../midlleware/auth/authMiddleware');
const {photoUpload,
        profilePhotoResize} = require('../../midlleware/uploads/photoUpload');

const userRoutes = express.Router();

userRoutes.put('/following', authMiddleware, followingUserCtrl);
userRoutes.put('/unfollowing', authMiddleware, unfollowUserCtrl);
userRoutes.put('/block-user/:id', authMiddleware, blockUserCtrl);
userRoutes.put('/unblock-user/:id', authMiddleware, unBlockUserCtrl);
userRoutes.post('/forget-password-token', forgetPasswordToken);
userRoutes.put('/reset-password', passwordResetCtrl);
userRoutes.post('/register', userRegisterCtrl);
userRoutes.post('/login', loginUserCtrl);
userRoutes.put('/upload-profile-photo/:id', authMiddleware, photoUpload.single('image'), profilePhotoResize, profilePhotoUploadCtrl);
userRoutes.post('/generate-verify-email-token', authMiddleware, generateVerificationTokenControl);
userRoutes.put('/verify-account/:token', authMiddleware, accountVerificationCtrl);
userRoutes.get('/profile/:id', authMiddleware, userProfileCtrl);
userRoutes.put('/update-profile/:id', authMiddleware, updateUserCtrl);
userRoutes.put('/password/password', authMiddleware, updateUserPasswordCtrl);
userRoutes.delete('/delete/:id', deleteUsersCtrl);
userRoutes.put('/viewed', authMiddleware, viewedProfile);
userRoutes.get('/:id', fetchUserDetailsCtrl);
userRoutes.get('/users/all', authMiddleware, fetchUsersCtrl);

module.exports = userRoutes;