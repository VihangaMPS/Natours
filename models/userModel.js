const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt =require('bcryptjs');
const crypto = require('crypto');

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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});

// Encrypting password when new User Signup --------------------
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // encrypting password ---------
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // Deleting passwordConfirm field from adding to Mongo DB,bcuz we don't need it other than only for validation

    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;

    next();
});

// Instance Method Comparing bcrypt password to user login password -----------------
userSchema.methods.correctPassword = async function (candidatePassword, userEncryptPassword) {
    return await bcrypt.compare(candidatePassword, userEncryptPassword); // return true  or false
};

// Checking password again if user have changed -------------------
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        // console.log( JWTTimestamp,changedTimestamp, (JWTTimestamp < changedTimestamp));
        return JWTTimestamp < changedTimestamp;
    }

    return false; // False means NOT changed
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex'); // creating random token, to send to user

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // creating encrypted token using the real resetToken & storing in database
    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + (10*60*1000);

    return resetToken;
}

const User = mongoose.model('User', userSchema)


module.exports = User;

// change password method : 22:15