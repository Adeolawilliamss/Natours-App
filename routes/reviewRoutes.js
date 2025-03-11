const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//SUB MIDDLEWARE FOR THIS MINI-APPLICATION
const router = express.Router({ mergeParams: true });

//POST/tour/44647833/reviews
//GET/tour/44647833/reviews

router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews);

router.post(
  '/sendReviews',
  authController.protect,
  reviewController.createReview,
);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
