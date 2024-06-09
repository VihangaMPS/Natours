const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Creating JWT Token  ----------------
const signToken = id => {
    return jwt.sign({ id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

// Sending the created token, when Signup,Login,ResetPassword,UpdatePassword
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({ // 201 - created
        status: 'success',
        token: token,
        data: {
            user: user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // 1)Checking email password exists
    if (!email || !password) {
        next(new AppError('Please provide email and password', 400)); // 400 - Bad request
    }

    // 2)Check if user exists & password is correct
    const user = await User.findOne({email: email}).select('+password'); // + -> add this hidden field for the output

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401)); // 401 - Unauthorized
    }

    // 3)If everything ok, send token to client
    createSendToken(user, 200, res);
});

exports.protect = catchAsync( async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1]; // Splitting the token from authorization header(Bearer "token")
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access', 401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('The User belonging to the token does not exists!', 401))
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changePasswordAfter(decoded.iat)) { // iat -> created time | exp -> expired time
        return next(new AppError('User recently changed password! Please login again', 401));
    }

    // 5) Grant access to Protected Route
    req.user = currentUser;

    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403)); // Forbidden error
        }

        next();
    }
}

exports.forgotPassword = catchAsync( async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Deactivating Validation in schema bcuz we are saving data in database

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.
    \nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
});

exports.resetPassword = catchAsync( async (req, res, next) => {
    // 1) Get User based on the token
    // console.log(crypto.getHashes()) // we can get all the algorithms used by crypto
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt:Date.now()}});
    console.log("user :", user);
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changePasswordAt property for the user


    // 4) Log the user in,send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync( async(req, res,next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");
    console.log(user);
    console.log(req.body);
    // 2) Check if POST current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    // 3) If Correct, Update Password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});
