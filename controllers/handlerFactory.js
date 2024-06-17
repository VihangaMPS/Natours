const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    console.log("req.query : " , req.query);

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No Document found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        // (updateId, body object, options object )
        new: true, // return the new modified document rather than the old document.Default is false
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No Document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            document: doc
        }
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            document: doc
        }
    });
});