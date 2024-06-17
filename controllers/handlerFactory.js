const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

exports.getAll = Model => catchAsync(async (req, res, next) =>  {
    // To Allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) {
        filter = { tour: req.params.tourId }
    }

    const features = new APIFeatures(Model.find(filter), req.query).filter().sortData().limitFields().pagination() ;
    const doc = await features.query;

    res.status(200)
        .json({
            status: 'success',
            results: doc.length,
            data: {
                document: doc
            }
        });
});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    // const doc = await Model.findById(req.params.id).populate('reviews');
    // Populate means -> if we don't use populate we get only the reference id.
    // if we use populate we get the data for that reference id but only give in response,not updating real database.

    if (!doc) {
        return next(new AppError('No Document found with that ID', 404));
    }

    res.status(200)
        .json({
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

