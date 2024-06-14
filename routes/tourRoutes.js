const express = require("express");
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

// ==========  Routes  ==============
const tourRouter = express.Router();

    // ------------ Custom Routes ------------
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

    // ------------ REST Routes ------------
tourRouter.route('/').get(authController.protect,tourController.getAllTours).post(tourController.createTour);
tourRouter.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.deleteTour);

tourRouter.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'),reviewController.createReview);

module.exports = tourRouter;
