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
  const tours = await Tour.find();
  const overviewClass = 'overview-page';
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
    overviewClass
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
  // Define pageClass before passing it to res.render
  const pageClass = 'tour-page';

  // 3. Render the page with hasBooked passed to the template
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    hasBooked,
    pageClass
  });
});

exports.getManageTourPage = catchAsync(async (req, res, next) => {
  // Fetch all tours for display
  const tours = await Tour.find();

  // Fetch a single tour if an ID (or slug) is provided
  let tour = null;
  if (req.params.slug) {
    tour = await Tour.findOne({ slug: req.params.slug });
    if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
    }
  }

  res.status(200).render('manageTours', {
    title: 'Tour Admin Page',
    tour,
    tours,
  });
});

exports.getManageUserPage = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // Fetch a single user if an ID is provided
  let user = null;
  if (req.params.id) {
    // Use req.params.id instead of req.user.id
    user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID.', 404));
    }
  }

  res.status(200).render('manageUsers', {
    title: 'User Admin Page',
    users,
    user,
    loggedInUser: req.user,
  });
});

exports.getManageReviewsPage = catchAsync(async (req, res, next) => {
  // Fetch all reviews with user and tour details
  const reviews = await Review.find()
    .populate('user', 'name')
    .populate('tour', 'name');

  // Fetch all users for dropdown selection
  const users = await User.find().select('name');

  // Fetch all tours for dropdown selection
  const tours = await Tour.find().select('name');

  // Fetch a single review if an ID is provided (for editing)
  let review = null;
  if (req.params.id) {
    review = await Review.findById(req.params.id)
      .populate('user', 'name')
      .populate('tour', 'name');
    if (!review) {
      return next(new AppError('No review found with that ID.', 404));
    }
  }

  res.status(200).render('manageReviews', {
    title: 'Reviews Admin Page',
    reviews, // All reviews
    users, // All users (for dropdown)
    tours, // All tours (for dropdown)
    review, // Single review for editing
  });
});

exports.getManageBookingsPage = catchAsync(async (req, res, next) => {
  // Fetch all bookings and populate the 'tour' field
  const bookings = await Booking.find();
  await Booking.populate(bookings, { path: 'tour', select: 'startDates name' });

  // Format startDates for each booking
  const formattedBookings = bookings.map((booking) => {
    const formattedDates = booking.tour?.startDates
      ?.map((sd) =>
        new Date(sd.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      )
      .join(', ');

    return {
      ...booking.toObject(),
      formattedStartDates: formattedDates || 'No dates available',
    };
  });

  console.log(formattedBookings);

  // Fetch a single booking if an ID is provided
  let booking = null;
  if (req.params.id) {
    booking = await Booking.findById(req.params.id)
  }

  res.status(200).render('manageBookings', {
    title: 'Bookings Admin Page',
    bookings: formattedBookings,
    booking,
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
  const overviewClass = 'overview-page';
  res.status(200).render('login', {
    title: 'Log into your Account',
    overviewClass
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
  const pageClass = 'tour-page';
  res.status(200).render('account', {
    title: 'Your Account',
    pageClass
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

  // Define a class for the body if you want (optional)
  const overviewClass = 'overview-page';

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
    overviewClass,
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
