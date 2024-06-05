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
    }
});

// Encrypting password when new User Signup --------------------
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // encrypt password ---------
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // we delete passwordConfirm bcuz we don't need it other than only for validation

    next();
});

// Instance Method Comparing bcrypt password to user login password -----------------
userSchema.methods.correctPassword = async function (candidatePassword, userEncryptPassword) {
    return await bcrypt.compare(candidatePassword, userEncryptPassword);
};

const User = mongoose.model('User', userSchema)


module.exports = User;