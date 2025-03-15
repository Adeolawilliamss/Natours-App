const crypto = require('crypto');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert = `Your booking was successful! Please check your email for confirmation.
    If your booking doesn\nt show up immediately,please come back later`;
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  //1} Get tour data from collection
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  console.log('Fetching tour details for:', req.params.slug);

  // 1. Find the tour by slug
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2. Check if the logged-in user has any bookings for this tour
  let hasBooked = false;
  // console.log('Checking if user is logged in:', req.user);
  if (req.user) {
    const userBookings = await Booking.find({ user: req.user.id }).populate(
      'tour',
    );
    // Check if any of these bookings match the current tour's _id
    hasBooked = userBookings.some(
      (booking) => booking.tour._id.toString() === tour._id.toString(),
    );
    console.log('User has booked this tour:', hasBooked);
  }

  // 3. Render the page with hasBooked passed to the template
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    hasBooked, // Boolean value used in the Pug template
  });
});

exports.leaveReviews = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  console.log('Tour ID passed to template:', tour._id); // ✅ Debugging log

  res.status(200).render('leaveReviews', {
    title: 'Leave a Review',
    tourId: tour._id, // Pass tour ID to the template
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your Account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your Account',
  });
};

exports.getOtpPage = (req, res, next) => {
  res.render('otp');
};

exports.getSignupPage = (req, res, next) => {
  res.render('signupConfirm');
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.verifyEmail = catchAsync(async (req, res) => {
  // Hash token (because we saved the hashed version in DB)
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find user with this token
  const user = await User.findOne({ verificationToken: hashedToken });

  if (!user) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Token is invalid or has expired' });
  }

  // Mark email as verified
  user.emailVerified = true;
  user.verificationToken = undefined; // Remove token after verification
  await user.save({ validateBeforeSave: false });

  res.status(200).render('successEmail', {
    title: 'Email has been verified',
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1}Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  //2}Find Tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  //Find all reviews
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name imageCover', // Include only necessary tour
  });

  // Filter out reviews where tour is null
  const validReviews = reviews.filter((review) => review.tour !== null);

  //Render the Reviews Page
  res.status(200).render('reviews', {
    title: 'My Reviews',
    reviews: validReviews, // Only send valid reviews
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});

exports.deleteAllBookings = factory.deleteOne(Booking);
