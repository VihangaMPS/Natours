const Tour = require('../models/tourModel');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// ==========  Handler Functions  ==============
exports.getAllTours = async (req, res) => {
    try {
        console.log(req.query); // request info -> ex:{ duration: { gte: '5' }, difficulty: 'easy', price: { lt: '1000' } }

        // 1a) Filtering
        // ---------- Build Query ----------
        const queryObj = {...req.query};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(element => delete queryObj[element])

        // 1b) Advanced Filtering
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // console.log(queryString); // ex: {"duration":{"$gte":"5"},"difficulty":"easy","price":{"$lt":"1000"}}
        // console.log(JSON.parse(queryString)); // converting JSON String to a JSON Object

        let query = Tour.find(JSON.parse(queryString)); // find() returns a query object

        // 2a) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt'); // setting default sort
        }

        // ---------- Execute Query ----------
        const tours = await query;

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
