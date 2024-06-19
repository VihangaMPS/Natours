const express = require("express");
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

// ==========  Routes  ==============
const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter);

    // ------------ Custom Routes ------------
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours);
tourRouter.route('/monthly-plan/:year').get(authController.protect,authController.restrictTo('admin', 'lead-guide', 'guide'),tourController.getMonthlyPlan);

tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

    // ------------ REST Routes ------------
tourRouter.route('/').get(tourController.getAllTours)
    .post(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.createTour);
tourRouter.route('/:id').get(tourController.getTour)
    .patch(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.updateTour)
    .delete(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.deleteTour);

// tourRouter.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'),reviewController.createReview);

module.exports = tourRouter;
