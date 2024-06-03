const express = require("express");
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

                // ==========  Routes  ==============
const userRouter = express.Router();

    // -------------- Custom Routes --------------
userRouter.route('/signup').post(authController.signup)

    // -------------- REST Routes --------------
userRouter.route('/').get(userController.getAllUsers).post(userController.createUser);
userRouter.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = userRouter;