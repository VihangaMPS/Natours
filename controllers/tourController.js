const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');


// ==========  Handler Functions  ==============
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage'; // - -> DESC(10-1) | + -> ASC(1-10)
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, {path: 'reviews'});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

// Custom Aggregate Functions --------------
exports.getTourStats = catchAsync(async (req, res, next) => {
    // we use aggregate to find min,max,sum,distance calculation values
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

exports.getToursWithin = catchAsync( async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(",");
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next( new AppError('Please provide latitude and longitude in the format lat,lng', 400));
    }

    // console.log(distance, lat, lng, unit);
    const tours = await Tour.find({
        startLocation: {$geoWithin: {
            $centerSphere: [[lng, lat], radius]
            }}
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
});