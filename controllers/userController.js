const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(element => { // Lopping through only keys in passed object
        if (allowedFields.includes(element)) {
            newObj[element] = obj[element];
        }
    });

    return newObj;
};

            // ==========  Handler Functions  =============

// ---- Only use this route for Update User 'name' & 'email' fields no password -------
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

// ------------- Only deactivating user not deleting permanently in database -------------
exports.deleteMe = catchAsync( async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    })
});


exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use "/signup" route instead'
    });
};

// ----------- Updating user data other than password field -----------
exports.updateUser = factory.updateOne(User);

// ------------- Deleting user permanently from database -------------
exports.deleteUser = factory.deleteOne(User);