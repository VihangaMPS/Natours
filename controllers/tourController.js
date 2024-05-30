const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// ==========  Handler Functions  ==============
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = async (req, res) => {
    try {
        console.log("getAllTours req.query : " , req.query); // request info -> ex:{ duration: { gte: '5' }, difficulty: 'easy', price: { lt: '1000' } }

        // ---------- Execute Query ----------
        const features =
            new APIFeatures(Tour.find(), req.query).filter().sortData().limitFields().pagination() ;
        const tours = await features.query;

        res.status(200)
            .json({
                status: 'success',
                results: tours.length,
                data: {
                    tours: tours
                }
            });
    } catch (err) {
        res.status(404).json({
            status: "Fail",
            message: err
        })
    }
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        res.status(200)
            .json({
                status: 'success',
                data: {
                    tour: tour
                }
            });
    } catch (err) {
        res.status(404).json({
            status: 'Fail',
            message: err
        });
    }
};

exports.createTour = async (req, res) => {
    try {
        console.log(req.body);
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err
        })
    }
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { // (updateId, body object, options object )
            new: true, // return the new modified document rather than the old document.Default is false
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err
        })
    }
};

exports.deleteTour = async (req, res) => {
    try {
        console.log("req.query : " , req.query);

        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err
        })
    }
};

exports.getTourStats = async (req, res) => { // we use aggregate to find min,max,sum,distance calculation values
    try {
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

    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err
        })
    }
}

exports.getMonthlyPlan = async  (req, res) => {
    try {
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

    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err
        })
    }
}