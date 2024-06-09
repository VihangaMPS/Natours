const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const e = require("express");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(element => { // Lopping through only keys in passed object
        if (allowedFields.includes(element)) {
            newObj[element] = obj[element];
        }
    });

    return newObj;
};

// ==========  Handler Functions  ==============
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200)
        .json({
            status: 'success',
            results: users.length,
            data: {
                tours: users
            }
        });
});

// ---- Only use this route for Update User data other than Password -------
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POST password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password Change Updates!', 400));
    }

    // 2) Filtered unwanted fields that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new : true, // return  updated new object
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
});

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};