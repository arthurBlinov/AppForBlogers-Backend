const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
//create Schema

const userSchema = new mongoose.Schema({
    firstName: {
        required: [true, 'First Name is required'],
        type: String,
    },
    lastName: {
        required: [true, 'Last Name is required'],
        type: String,
    },
    profilePhoto: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909__340.png',
    },
     email: {
            type: String,
            required: [true, 'Email is required']
        },
        password: {
            type: String,
            required: [true, 'password is required']
        },
        postCount: {
            type: Number,
            default: 0
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum:['Admin', 'Guest', 'Blogger']
        },
        isFollowing: {
            type: Boolean,
            default: false
        },
        isUnFollowing: {
            type: Boolean,
            default: false
        },
        isAccountVerified: {
            type: Boolean,
            default: false
        },
        accountVerificationToken: String,
        accountVerificationTokenExpires: Date,
        viewedBy: {
            type: [
                {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
                }
            ],

        },
    followers: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    following: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    timestamps: true
});
//virtual method to populate create post
userSchema.virtual('posts', {
    ref: 'Post',
    foreignField: 'user',
    localField: '_id',
})
//Account Type
userSchema.virtual('accountType').get(function() {
    const totalFollowers = this.followers?.length;
    return totalFollowers >= 10 ? 'Pro Account' : 'Starter Account';
})
//Hash Password
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        
        next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

//match password
userSchema.methods.isPasswordMatched = async function(enteredPassword){
    
    return await bcrypt.compare(enteredPassword, this.password)
}
//Verify account 
userSchema.methods.createAccountVerificationToken = async function(){
    //create a token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.accountVerificationToken = 
    crypto.createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    this.accountVerificationTokenExpires = Date.now() + 30 * 60 *1000; //10 minutes
    return verificationToken;
}
//password reset/forget password
userSchema.methods.createPasswordResetToken = async function(){
    //create a token
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = 
    crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    this.passwordResetExpires = Date.now() + 30*60*1000; //10 min
    return resetToken;
}
//Compile Schema into model
const User = mongoose.model('User', userSchema);
module.exports = User;



