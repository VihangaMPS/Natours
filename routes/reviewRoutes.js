const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

// Create a Review & Get all created Reviews -----------------
reviewRouter.route('/').get(reviewController.getAllReviews)
    .post(authController.protect, authController.restrictTo('user'),reviewController.setTourUserId,reviewController.createReview);

reviewRouter.route('/:id').patch(reviewController.updateReview).delete(reviewController.deleteReview);


module.exports = reviewRouter;