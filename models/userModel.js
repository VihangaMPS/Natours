const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt =require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid Email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: 10,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please Confirm your password'],
        validate: { // Only in SAVE & CREATE
            validator: function (element) {
                return element === this.password
            },
            message: 'Passwords are not same'
        }
    },
    passwordChangedAt: Date
});

// Encrypting password when new User Signup --------------------
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // encrypting password ---------
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // Deleting passwordConfirm field from adding to Mongo DB,bcuz we don't need it other than only for validation

    next();
});

// Instance Method Comparing bcrypt password to user login password -----------------
userSchema.methods.correctPassword = async function (candidatePassword, userEncryptPassword) {
    return await bcrypt.compare(candidatePassword, userEncryptPassword); // return true  or false
};


userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);

        // console.log( JWTTimestamp,changedTimestamp, (JWTTimestamp < changedTimestamp));
        return JWTTimestamp < changedTimestamp;
    }

    return false;
}

const User = mongoose.model('User', userSchema)


module.exports = User;

// change password method : 22:15