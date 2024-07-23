const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Get all reviews & Get all reviews on a single tour ----------------------
exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

// Nested route
exports.setTourUserId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId; // Only call if we don't specify tour id in req body & assign the tour id in req parameters
    if (!req.body.user) req.body.user = req.user.id; // Getting the user.id from "Protect" that currently logged-in user

    next();
}
exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);