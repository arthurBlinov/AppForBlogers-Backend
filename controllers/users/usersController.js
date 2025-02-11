const User = require('../../model/user/User');
const expressAsyncHandler = require('express-async-handler');
const generateToken = require('../../config/token/generateToken');
const validateMongodbId = require('../../utils/validateMongodbID');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const crypto = require('crypto');
const cloudinaryUploadImg = require('../../utils/cloudinary');
const blockUser = require('../../utils/blockUser');
const dotenv = require('dotenv');

dotenv.config();
sgMail.setApiKey(`${process.env.SENDGRID_API_KEY}`);

//Register
const userRegisterCtrl = expressAsyncHandler(
    async (req, res) => {
        //Check if user exists
        const userExists = await User.findOne({email: req?.body?.email});
        if(userExists) 
        throw new Error('User already Exists');
        else{
        //Register User
       try {
        const user = await User.create({
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            password: req?.body?.password
        });
        res.json(user);     
        } catch (error) {
            res.json(error);
        }
    }   
    }
)
//Login
const loginUserCtrl = expressAsyncHandler(async (req, res) => {
    const {email, password} = req.body;
    //check if user exists
    const userFound = await User.findOne({email});
    let token;
    //check if password is matched
    if(userFound && await userFound.isPasswordMatched(password)){
        token = generateToken(userFound?.id)
        res.json({
            _id: userFound?.id,
            firstName: userFound?.firstName,
            lastName: userFound.lastName,
            email: userFound?.email,
            profilePhoto: userFound?.profilePhoto,
            isAdmin: userFound?.isAdmin, 
            token: token,
            isAccountVerified: userFound?.isAccountVerified

        });
        if(!userFound?.isAccountVerified){
            const verificationURL = `
                <p>If you requested to verify your account, verify now by clicking the link below:</p>
                    <a href=http://localhost:3000/account/verify/${token}>Click here to verify your account</a>
                `;
        const msg = {
            to: userFound.email,
            from: "blinov.arthur.2023@gmail.com",
            subject: "Verify Account",
            html: verificationURL,
        };

        await sgMail.send(msg);   
        }
        
    } else {
        res.status(401);
        throw new Error ('Invalid login Credentials');
    }
})
//Users
const fetchUsersCtrl= expressAsyncHandler(async(req,res) => {
        try {
            const usersList = await User.find({}).populate('posts');
            res.json(usersList);
        } catch (error) {
            res.json(error);
        }
})

//Delete User

const deleteUsersCtrl = expressAsyncHandler(async (req, res) => {
    const {id} = req?.params;
    //check if id is valid
    validateMongodbId(id);
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        res.json(deletedUser);
    } catch (error) {
        res.json(error);
    }
})
//User details
const fetchUserDetailsCtrl = expressAsyncHandler(async (req,res) => {
    const {id} = req.params;
    validateMongodbId(id);
    try {
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        res.json(error);
    }
})
//who viewed profile
const viewedProfile = expressAsyncHandler(async (req,res) => {
    const {id} = req?.body;
    const loginUserId = req?.user?._id;
    const myProfile = await User.findById(id);
    let viewedArray = myProfile?.viewedBy;
    let alreadyViewed;
    
    try {
        if(id.toString() != loginUserId.toString()){
            for(i = 0; i < viewedArray.length;i++){
                if(viewedArray[i].toString() == loginUserId.toString())
                        alreadyViewed = true;
            }             
           
                
                if(alreadyViewed){
                  const updatedProfile = await User.findByIdAndUpdate(myProfile?._id, {
                        $pull: {viewedBy: loginUserId}
                    },{
                        new: true
                    })
                   res.json(updatedProfile)
                }else{
                   const updatedProfile = await User.findByIdAndUpdate(myProfile?._id, {
                        $push:{viewedBy: loginUserId}
                    }, {
                        new: true
                    })
                   res.json(updatedProfile)
                }
            }
    } catch (error) {
        res.json(error)
    }
    
})
//User Profile
const userProfileCtrl = expressAsyncHandler(async (req,res) => {
    const {id} = req?.params;
    validateMongodbId(id);

    const loginUserId = req?.user?._id;
    try {
        const myProfile = await User.findById(id)
                .populate('posts')
                .populate('viewedBy');
                if(id.toString() != loginUserId.toString()){
                    User.findByIdAndUpdate(myProfile?._id, {
                                $push: {viewedBy: loginUserId}
                            })
                     }
        res.json(myProfile);
    } catch (error) {
        res.json(error);
    }
})
//Update Profile
const updateUserCtrl = expressAsyncHandler(async(req,res)=> {
    const {_id} = req?.user;
    validateMongodbId(_id);
    blockUser(req?.user);
    const user = await User.findByIdAndUpdate(_id, {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        bio: req?.body?.bio,
        viewedBy: []
    }, {
        new: true,
        runValidators: true
    });
    res.json(user);
})

//Update password 
const updateUserPasswordCtrl = expressAsyncHandler(async (req, res) => {
    //destruct the logined user 
    const {_id} = req.user;
    const {oldPassword, newPassword} = req.body;
    validateMongodbId(_id);
    //Find the user by Id
    const user = await User.findById(_id);
    if(user.isPasswordMatched(oldPassword)){
        user.password = newPassword;
        const updateUser = await user.save();
        res.json(updateUser);     
        return ;
    }
    res.json(user);
})
const followingUserCtrl = expressAsyncHandler(async (req,res) => {
    const {followId} = req?.body;
    const loginUserId = req.user._id;
   
    const userTarget = await User.findById(followId);
    let followersArray = userTarget?.followers;
    let following;
    
    for(i = 0; i < followersArray.length;i++){
        if(followersArray[i].toString() == loginUserId.toString())
            following = true;
        }
        if(following){
            const updatedUser = await User.findByIdAndUpdate(followId, {
                $pull: {followers: loginUserId},
            }, {
                new: true
            })
            res.json(updatedUser);
        }else{
            const updatedUser = await User.findByIdAndUpdate(followId, {
                $push: {followers: loginUserId},
            }, {
                new: true
            })
            res.json(updatedUser);
        }
})
//unfollow 
const unfollowUserCtrl = expressAsyncHandler(async(req, res) => {
    const {unfollowId} = req.body;
    const loginUserId = req.user.id;
    await User.findByIdAndUpdate(unfollowId, {
        $pull: {followers: loginUserId},
        isfollowing: false
    }, 
        {new: true})

    await User.findByIdAndUpdate(loginUserId, {
        $pull: {following: unfollowId},
    },
        {new: true})
    res.json('you have succesfully unfollowed this user');
})

//Block User
const blockUserCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req?.params;
    validateMongodbId(id);
    const user = await User.findByIdAndUpdate(id, {
        isBlocked: true,
    },
        {new: true});
    res.json(user);
})
//Unblock user
const unBlockUserCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    const user = await User.findByIdAndUpdate(id, {
        isBlocked: false,
    },
        {new: true});
    res.json(user);
})

//Account Verification - Send Email
const generateVerificationTokenControl = expressAsyncHandler(async (req,res) => {
    const loginUser = req.user.id;
    const user = await User.findById(loginUser);
    try {
        //generate token
        const verificationToken = await user.createAccountVerificationToken();
        //save the user
        await user.save();
       // console.log(verificationToken);
       //build your message
       const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message
       <a href="http://localhost:3000/verify-account/${verificationToken}">Click</a>`
    //    console.log(user?.email);
       const msg = {
           to: user?.email,
           from: 'blinov.arthur.2023@gmail.com',
           subject: 'Verify Account',
           html: resetURL
       }
    //    console.log(msg);
       await sgMail.send(msg).then(res.json(resetURL));
       
    } catch (error) {
        res.json(error);
    }
})
//account verification
const accountVerificationCtrl = expressAsyncHandler(async (req,res) => {
    const {token} = req?.params;
    // console.log(token);
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const id = req?.user?._id.toString();
    // console.log(id);
    
    //find this user by token
    const userFound = await User.findByIdAndUpdate(id, {
        accountVerificationToken: hashedToken,
        //accountVerificationTokenExpires: {$gt: new Date()},
        isAccountVerified: true
    })
    
    await userFound.save();
    res.json(userFound);
})
//forget password
const forgetPasswordToken = expressAsyncHandler(async (req, res) => {
    //find user by email
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new Error('User not found');

    try {
       const token = await user.createPasswordResetToken();
       await user.save()
       const resetURL = `If you were requested to reset your password, reset now within 10 minutes,
       otherwise ignore this message
       <a href="http://localhost:3000/reset-password/${token}">Click</a>`
       const msg = {
           to: email,
           from: 'blinov.arthur.2023@gmail.com',
           subject: 'Reset Password',
           html: resetURL
       }
      await sgMail.send(msg);
       res.json({
           msg: `A verification message is succesfully sent to ${user?.email}. Reset now within 10 minutes,
           ${resetURL}`
       });
    } catch (error) {
        res.json(error);
    }

})


//Password reset controller
const passwordResetCtrl = expressAsyncHandler(async (req, res) => {
    const {token, password} = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    //find this user by token
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {
        $gt: Date.now()
    }});
    
    if(!user) throw new Error('Token Expired, try again latter');
    //Update/change the password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
})

//profile photo upload
const profilePhotoUploadCtrl = expressAsyncHandler(async (req,res) => {
    //find the login user
    const {_id} = req.user;
    blockUser(req?.user);
    //get the path to the image 
    const localPath = `public/images/profile/${req.file.filename}`;
    
    //upload to cloudinary
    const imgUpload = await cloudinaryUploadImg(localPath);
    
    await User.findByIdAndUpdate(_id, {
        profilePhoto: imgUpload?.url,
    }, {new: true})
    //remove the saved images
    fs.unlinkSync(localPath);
    res.json(imgUpload);
})


module.exports = {
    userRegisterCtrl, 
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
    viewedProfile
};