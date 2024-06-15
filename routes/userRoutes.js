const express = require("express");
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

                // ==========  Routes  ==============
const userRouter = express.Router();

    // -------------- Custom Routes --------------
userRouter.route('/signup').post(authController.signup);
userRouter.route('/login').post(authController.login);
userRouter.route('/forgotPassword').post(authController.forgotPassword);
userRouter.route('/resetPassword/:token').patch(authController.resetPassword);
userRouter.route('/updateMyPassword').patch(authController.protect,authController.updatePassword);
userRouter.route('/updateMe').patch(authController.protect,userController.updateMe); // updating the current logged-in user
userRouter.route('/deleteMe').delete(authController.protect,userController.deleteMe); // deleting the current logged-in user

    // -------------- REST Routes --------------
userRouter.route('/').get(userController.getAllUsers).post(userController.createUser);
userRouter.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = userRouter;