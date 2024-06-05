const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
    return jwt.sign({ id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

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
    })
});
