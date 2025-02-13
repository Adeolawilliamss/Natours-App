const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
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
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
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

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is onlu TEMPORARY, because its UNSECURE:Everyone can make booking without paying
  const { tour, user, price } = req.query;
  console.log('Tour ID received:', req.query.tour);

  if (!tour || !user || !price) return next();

  if (!mongoose.Types.ObjectId.isValid(tour)) {
    return next(new AppError('Invalid tour ID', 400));
  }

  await Booking.create({
    tour: new mongoose.Types.ObjectId(tour),
    user: new mongoose.Types.ObjectId(user),
    price: parseFloat(price),
  });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

//CHALLENGES FOR THE API!
//Implement restriction that only users can review a tour that they have actually booked

//Implement nested Booking routes:/tours/:id/bookings and users/:id/bookings
//Getting all the bookings for a certain tour and getting all the booking for a certain user based on ids

//improve tour dates:add a participants and soldOut field to each dates.And the dates then become like an
//instance of a tour.Then when the user books,they need to select one of the dates.A new booking will increase
//the number of participants in the date,until it is booked out(participants > maxGroupSize).So,when a user
//wants to book,you need to check if tour on the salected date is available.

//Implement advanced authentication features:confirm user email,keep users logged in with refresh tokens,
///tw-factor auth etc.

//CHALLENGES FOR THE WEBSITE!
//Implement a signup form,similar to the login form

//On the tour detail page,if a user has taken a tour,allow them add a review directly on a website.Implement a form for this

///Hide the entire Booking section on thr tour detail page if current user hhas already booked the tour
//(also prevent duplicate bookings on the backend model);

//Implement "Like Tour" functionality,with a favourite tour page

//On the user account page,ypu can implement the "My Reviews" page,where all the reviews are being displayed
//and a user can edit them(If you know React,this would be an amazing way to use the Natours API and train your skills);

//For administrators,implement the "Manage" pages,where they can CRUD(create,read,update,delete)tours,useers,reviews ,bookings
