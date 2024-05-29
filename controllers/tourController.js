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
        console.log("req.query : " , req.query); // request info -> ex:{ duration: { gte: '5' }, difficulty: 'easy', price: { lt: '1000' } }

        // ---------- Execute Query ----------
        const features = new APIFeatures(Tour.find(), req.query.filter().sort().limitFields().pagination());
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
