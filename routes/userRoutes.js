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

userRouter.use(authController.protect); // From this point all the below routes are protected

userRouter.route('/updateMyPassword').patch(authController.updatePassword);
userRouter.route('/me').get(userController.getMe,userController.getUser); // To get current logged-in user data
userRouter.route('/updateMe').patch(userController.updateMe); // Only use this route for Update current logged-in User 'name' & 'email' fields no password
userRouter.route('/deleteMe').delete(userController.deleteMe); // Only deactivating user not deleting permanently in database

userRouter.use(authController.restrictTo('admin'));
    // -------------- REST Routes --------------
userRouter.route('/').get(userController.getAllUsers).post(userController.createUser);
userRouter.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = userRouter;