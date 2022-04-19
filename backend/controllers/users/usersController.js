const User = require('../../model/user/User');
const expressAsyncHandler = require('express-async-handler');
const generateToken = require('../../config/token/generateToken');
const validateMongodbId = require('../../utils/validateMongodbID');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const crypto = require('crypto');
const userRoutes = require('../../route/users/usersRoute');
const cloudinaryUploadImg = require('../../utils/cloudinary');
const blockUser = require('../../utils/blockUser');
sgMail.setApiKey('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');


//Register
const userRegisterCtrl = expressAsyncHandler(
    async (req, res) => {
        console.log(req.body);
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
    
    //check if password is matched
    if(userFound && await userFound.isPasswordMatched(password)){
        res.json({
            _id: userFound?.id,
            firstName: userFound?.firstName,
            lastName: userFound.lastName,
            email: userFound?.email,
            profilePhoto: userFound?.profilePhoto,
            isAdmin: userFound?.isAdmin, 
            token: generateToken(userFound.id),
            isVerified: userFound?.isAccountVerified

        });
        
    } else {
        res.status(401);
        throw new Error ('Invalid login Credentials');
    }
})
//Users
const fetchUsersCtrl= expressAsyncHandler(async(req,res) => {
        // const {_id} = req?.user?._id;
        // validateMongodbId(_id);
        try {
            const usersList = await User.find({}).populate('posts');
            console.log(usersList);
            res.json(usersList);
        } catch (error) {
            res.json(error);
        }
})

//Delete User

const deleteUsersCtrl = expressAsyncHandler(async (req, res) => {
    const {id} = req?.params;
    console.log(id);
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
    console.log('loginUser', loginUserId.toString());
    console.log('id', id);
    try {
        if(id.toString() != loginUserId.toString()){
            for(i = 0; i < viewedArray.length;i++){
                if(viewedArray[i].toString() == loginUserId.toString())
                        alreadyViewed = true;
            }             
            console.log(alreadyViewed);
            console.log('is it done?');
                
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
        console.log(error);
        res.json(error)
    }
    
})
//User Profile
const userProfileCtrl = expressAsyncHandler(async (req,res) => {
    const {id} = req?.params;
    validateMongodbId(id);

    const loginUserId = req?.user?._id;
      // console.log(id.toString(), loginUserId.toString());
    try {
        const myProfile = await User.findById(id)
                .populate('posts')
                .populate('viewedBy');

        //let arrayOfViews = myProfile?.viewedBy;
        //console.log(arrayOfViews[0].toString());
        let viewed;
                if(id.toString() != loginUserId.toString()){
                    User.findByIdAndUpdate(myProfile?._id, {
                                $push: {viewedBy: loginUserId}
                            })
                            console.log('hello');
                //    for(i = 0; i < arrayOfViews.length;i++){
                //        if(arrayOfViews[i].toString() == loginUserId.toString())
                //             viewed = true;
                //    }
                // }
                // console.log(viewed);
                // if(viewed){
                //     User.findByIdAndUpdate(myProfile?._id, {
                //         $pull: {viewedBy: loginUserId}
                //     })
                // }else{
                //     User.findByIdAndUpdate(myProfile?._id, {
                //         $push: {viewedBy: loginUserId}
                //     })
                //      if(arrayOfViews?.length >= 1)
                //           console.log('hello');
                // }
         // if(id != loginUserId){
                //     myProfile?.viewedBy.forEach(element => {
                //         if(loginUserId == element.toString()){
                //             User.findOneAndUpdate(profileEmail, {
                //                 $pull: {viewedBy: loginUserId},
                                
                //             })
                            
                //         }else {
                           
                //             User.findOneAndUpdate(profileEmail, {
                //                 $push: {viewedBy: loginUserId},
                                
                //             })
                            
                //         }
                        
                //     });
                    
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
    const {password} = req.body;
    validateMongodbId(_id);
    console.log('hello');
    //Find the user by Id
    const user = await User.findById(_id);
    if(password){
        
        user.password = password;
        const updateUser = await user.save();
        res.json(updateUser);     
    }
    res.json(user);
})
const followingUserCtrl = expressAsyncHandler(async (req,res) => {
    //find the user you want to follow and update it's followers field
    const {followId} = req?.body;
    const loginUserId = req.user._id;
   
   
    //find the target user if the login userId exists in this array
    const userTarget = await User.findById(followId);
    let followersArray = userTarget?.followers;
    let following;
    
    for(i = 0; i < followersArray.length;i++){
        if(followersArray[i].toString() == loginUserId.toString())
            following = true;
        }
// console.log(following);
// console.log('userTarget', followId);
// console.log(followersArray);
//remove this user from likes array if he is exists
if(following){
    
    const updatedUser = await User.findByIdAndUpdate(followId, {
        $pull: {followers: loginUserId},
        
    }, {
        new: true
    })
    
    res.json(updatedUser);
    
}else{
    console.log('hello');
    console.log(followId);
    const updatedUser = await User.findByIdAndUpdate(followId, {
        $push: {followers: loginUserId},
        
    }, {
        new: true
    })
    
    res.json(updatedUser);
    
}

//console.log(alreadyDisLiked);
//toggling 

//     const alreadyFollowing = userTarget.followers.find(user => {
//         if(user)
//         return true;
//             return false;
//     })
    
//     if(alreadyFollowing) 
//         throw new Error('You have already followed this user');
//     else{
//     await User.findByIdAndUpdate(followId, {
//         $push: {followers: loginUserId},
//         isfollowing: true,
        
//     }, 
//         {new: true})
//     //update the login user following field
//     await User.findByIdAndUpdate(loginUserId, {
//         $push:{following: followId}
//     }, 
//         {new: true})
//     res.json('you have succesfully followed this user')
// }
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
    console.log(user);
    try {
        //generate token
        const verificationToken = await user.createAccountVerificationToken();
        //save the user
        await user.save();
       // console.log(verificationToken);
       //build your message
       const resetURL = `If you were requested to verify your account, verify now within 10 minutes, otherwise ignore this message
       <a href="http://localhost:3000/verify-account/${verificationToken}">Click</a>`
       const msg = {
           to: user?.email,
           from: 'blinov.arthur2020@gmail.com',
           subject: 'Verify Account',
           html: resetURL
       }
       await sgMail.send(msg).then(res.json(resetURL));
       
    } catch (error) {
        res.json(error);
    }
})
//account verification
const accountVerificationCtrl = expressAsyncHandler(async (req,res) => {
    const {token} = req?.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const id = req?.user?._id.toString();
    console.log(id);
    //find this user by token
    const userFound = await User.findByIdAndUpdate(id, {
        accountVerificationToken: hashedToken,
        //accountVerificationTokenExpires: {$gt: new Date()},
        isAccountVerified: true
    })
    //if(!userFound) throw new Error('Token expired, try again later');
    
    
    //update the property to true
    // userFound.isAccountVerified = true;
    // userFound.accountVerificationToken=undefined;
    // userFound.accountVerificationTokenExpires=undefined;
    console.log('userFound', userFound);
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
       console.log(token);
       await user.save()
       const resetURL = `If you were requested to reset your password, reset now within 10 minutes,
       otherwise ignore this message
       <a href="http://localhost:3000/reset-password/${token}">Click</a>`
       const msg = {
           to: email,
           from: 'blinov.arthur2020@gmail.com',
           subject: 'Reset Password',
           html: resetURL
       }
      await sgMail.send(msg);
       res.json({
           msg: `A verification messgae is succesfully sent to ${user?.email}. Reset now within 10 minutes,
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
    console.log(req.file.filename);
    //upload to cloudinary
    const imgUpload = await cloudinaryUploadImg(localPath);
    const foundUser = await User.findByIdAndUpdate(_id, {
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