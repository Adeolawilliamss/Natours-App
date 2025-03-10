const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewController.alerts);

router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview,
);
router.get('/user/verifyEmail/:token', viewController.verifyEmail);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', viewController.getLoginForm);
router.get('/signup', viewController.getSignupForm);
router.get('/otp', viewController.getOtpPage);
router.get('/confirmSignup', viewController.getSignupPage);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
router.get('/my-reviews', authController.protect, viewController.getMyReviews);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);

module.exports = router;
