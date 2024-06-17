const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// ==========  Handler Functions  ==============
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage'; // - -> DESC(10-1) | + -> ASC(1-10)
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = catchAsync(async (req, res, next) =>  {
    // console.log("getAllTours req.query : " , req.query);
    // request info -> ex:{ duration: { gte: '5' }, difficulty: 'easy', price: { lt: '1000' } }

    // ---------- Execute Query ----------
    const features = new APIFeatures(Tour.find(), req.query).filter().sortData().limitFields().pagination() ;
    const tours = await features.query;

    res.status(200)
        .json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours
            }
        });
});

exports.getTour = catchAsync(async (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log("req.params.id :", req.params.id);
    }
    const tour = await Tour.findById(req.params.id).populate('reviews');
    // Populate means -> if we don't use populate we get only the reference id.
    // if we use populate we get the data for that reference id but only give in response,not updating real database.

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200)
        .json({
            status: 'success',
            data: {
                tour: tour
            }
        });
});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => { // we use aggregate to find min,max,sum,distance calculation values
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5} } // ratingsAverage >= 4.5
        },
        {
            $group: {
                _id: { $toUpper: "$difficulty"},
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity'},
                avgRating: { $avg: '$ratingsAverage'},
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'},
            }
        },
        {
            $sort: { avgPrice: 1 } // 1 -> ASC & -1 -> DESC
        },
        // {
        //     $match: { _id: { $ne: 'EASY' }}
        // }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats: stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)

                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 15
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan: plan
        }
    });
});