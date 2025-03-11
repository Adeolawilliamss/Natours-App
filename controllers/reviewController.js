// const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setTourUserIDs = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = catchAsync(async (req, res, next) => {
  // Check if the user has a booking for the tour
  const booking = await Booking.findOne({
    user: req.user.id,
    tour: req.body.tour,
  });

  if (!booking) {
    return next(
      new AppError('You can only review tours you have booked.', 403),
    );
  }

  // Check if the user has already reviewed this tour
  const existingReview = await Review.findOne({
    user: req.user.id,
    tour: req.body.tour,
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this tour.', 400));
  }

  // If the user has booked the tour and hasn't reviewed it yet, proceed
  const review = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    tour: req.body.tour,
    user: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
