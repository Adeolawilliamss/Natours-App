const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.setTourUserIDs = (req, res, next) => {
  // If tourId is not in the body, get it from the URL
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // If userId is not in the body, get it from the logged-in user
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
          unit_amount: tour.price * 100, // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // 3) Send session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //This is only TEMPORARY, because its UNSECURE:Everyone can make booking without paying
//   const { tour, user, price } = req.query;
//   console.log('Tour ID received:', req.query.tour);

//   if (!tour || !user || !price) return next();

//   if (!mongoose.Types.ObjectId.isValid(tour)) {
//     return next(new AppError('Invalid tour ID', 400));
//   }

//   await Booking.create({
//     tour: new mongoose.Types.ObjectId(tour),
//     user: new mongoose.Types.ObjectId(user),
//     price: parseFloat(price),
//   });

//   res.redirect(req.originalUrl.split('?')[0]);
// });
const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email });

  if (!user) {
    console.error('User not found:', session.customer_email);
    return;
  }

  // Check if the booking already exists
  const existingBooking = await Booking.findOne({ tour, user: user.id });

  if (existingBooking) {
    console.log('Booking already exists. Skipping duplicate booking creation.');
    return;
  }

  // Fetch line items from Stripe
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const price = lineItems.data[0].amount_total / 100; // Convert from cents

  await Booking.create({
    tour: new mongoose.Types.ObjectId(tour),
    user: new mongoose.Types.ObjectId(user.id),
    price: parseFloat(price),
  });
};

exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error('⚠️  Webhook signature verification failed.', error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await createBookingCheckout(event.data.object);
    } catch (error) {
      console.error('❌ Error creating booking:', error);
    }
  }

  res.status(200).json({ received: true });
};

exports.createBooking = catchAsync(async (req, res, next) => {
  const { tourId, userId, startDate } = req.body;

  // Check if the booking already exists
  const existingBooking = await Booking.findOne({ tour: tourId, user: userId });

  if (existingBooking) {
    return next(new AppError('You have already booked this tour!', 400));
  }

  // Find the tour
  const tour = await Tour.findById(tourId);
  if (!tour) return next(new AppError('Tour not found', 404));

  // Find the selected date
  const tourDate = tour.startDates.find(
    (entry) => entry.date.toISOString() === new Date(startDate).toISOString(),
  );

  if (!tourDate) return next(new AppError('Invalid tour date', 400));

  // Check if the tour is sold out
  if (tourDate.soldOut) {
    return next(new AppError('This tour date is fully booked', 400));
  }

  // Increase participants
  tourDate.participants += 1;

  // Mark as sold out if maxGroupSize is exceeded
  if (tourDate.participants >= tour.maxGroupSize) {
    tourDate.soldOut = true;
  }

  // Save the updated tour
  await tour.save();

  // Create a new booking
  const newBooking = await Booking.create({
    tour: tourId,
    user: userId,
    startDate: new Date(startDate), // ✅ Ensure startDate is saved as a Date
    price: tour.price,
  });

  res.status(201).json({
    status: 'success',
    data: {
      booking: newBooking,
    },
  });
});

exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
//---------------------------------------------------------------------------------------

//CHALLENGES FOR THE WEBSITE!
//Implement "Like Tour" functionality,with a favourite tour page

//On the user account page,ypu can implement the "My Reviews" page,where all the reviews are being displayed
//and a user can edit them(If you know React,this would be an amazing way to use the Natours API and train your skills);

//For administrators,implement the "Manage" pages,where they can CRUD(create,read,update,delete)tours,users,reviews,bookings
