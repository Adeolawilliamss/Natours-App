const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const tourRouter = require('./starter/routes/tourRoutes');
const userRouter = require('./starter/routes/userRoutes');
const reviewRouter = require('./starter/routes/reviewRoutes');
const bookingRouter = require('./starter/routes/bookingRoutes');
const viewRouter = require('./starter/routes/viewRoutes');
const AppError = require('./starter/utils/appError');
const globalErrorHandler = require('./starter/controllers/errorController');

//Starts express App immediately
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'starter/views'));

//GLOBAL MIDDLEWARES:THESE ARE APPLIED TO ALL FILES
//Implement CORS
app.use(cors());
//Access-Control-Allow-Origin *
//Assuming we had backend at api.natours.com and frontend at natours.com,
// app.use(
//   cors({
//     origin: 'https://www.natours.com',
//   }),
// );

// app.options('*', cors());
// app.options('api/v1/tours/id', cors());
//Serving static files
app.use(express.static(path.join(__dirname, 'starter/public')));

//Set security HTTP headers
// app.use(helmet());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'https://unpkg.com'],
        connectSrc: ["'self'", 'ws://127.0.0.1:*'], // Allow WebSocket connections
        scriptSrc: ["'self'", 'https://js.stripe.com', 'https://api.mapbox.com'],
        styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://api.mapbox.com'],
        frameSrc: ["'self'", 'https://js.stripe.com'],
      },
    },
  }),
);

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,try again in an hour!',
});
app.use('/api', limiter);

//Body parser,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Cookie parser middleware
app.use(cookieParser()); // Parse cookies and make them available in req.cookies

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//Data sanitization against noSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS(cross side sripting attacks)
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
  }),
);

app.use(compression());

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  //consol.log(req.cookies);
  next();
});

//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//THIS WOULD ONLY BE REACHED IF ALL THE OTHER ROUTERS PLUS THE TOURS AND USER ROUTERS DIDNT CATCH IT
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
