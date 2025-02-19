const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

//SUB MIDDLEWARE FOR THIS MINI-APPLICATION
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

// router.use(authController.restrictTo('admin', 'lead-guide'));

router.post(
  '/',
  authController.protect,
  authController.restrictTo('user'),
  bookingController.setTourUserIDs, // Automatically assigns tour & user ID
  bookingController.createBooking,
);

// Get all bookings, with filtering by user or tour
router.get('/', bookingController.getAllBookings);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
