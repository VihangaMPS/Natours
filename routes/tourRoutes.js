const express = require("express");
const tourController = require('../controllers/tourController');

// ==========  Routes  ==============
const tourRouter = express.Router();

    // ------------ CRUD ------------
tourRouter.route('/').get(tourController.getAllTours).post(tourController.createTour);
tourRouter.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

    // ------------ Custom Routes ------------
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

module.exports = tourRouter;
