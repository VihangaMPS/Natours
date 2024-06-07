const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Creating JWT Token  ----------------
const signToken = id => {
    return jwt.sign({ id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);

    res.status(201).json({ // 201 - created
        status: 'success',
        token: token,
        data: {
            user: newUser
        }
    })
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
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token: token
    });
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
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // taking payload data using authorized token & jwt secret

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
