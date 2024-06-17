const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');


exports.getAllReviews = catchAsync( async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
        filter = { tour: req.params.tourId }
    }

    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews: reviews
        }
    });
});

exports.setTourUserId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId; // Only call if we don't specify tour id in req body & assign the tour id in req parameters
    if (!req.body.user) req.body.user = req.user.id; // Getting the user.id from "Protect"

    next();
}
exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);