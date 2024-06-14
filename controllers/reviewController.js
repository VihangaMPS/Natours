const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync( async (req, res, next) => {
    const reviews = await Review.find();

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews: reviews
        }
    });
});

exports.createReview = catchAsync( async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId; // Only call if we don't specify tour id in req body & assign the tour id in req parameters
    if (!req.body.user) req.body.user = req.user.id; // Getting the user.id from "Protect"

    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            reviews: newReview
        }
    });
});