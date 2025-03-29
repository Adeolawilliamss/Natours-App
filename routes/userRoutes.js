const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const bookingRouter = require('./bookingRoutes');

//SUB MIDDLEWARE FOR THIS MINI-APPLICATION
const router = express.Router();

router.use('/:userId/bookings', bookingRouter); // This forwards the userId to bookingRoutes

router.post('/signup', authController.signUp);
router.post('/verifyEmail/:token', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/logout', authController.logOut);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//This protects all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);

router.patch('/updateUser/:id', userController.updateUser);

router.delete('/deleteMe', userController.DeleteMe);

router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUsers)
  .delete(userController.deleteUsers);

module.exports = router;
