/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { reviews } from './reviews';
import { verifyOtp } from './otp';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { createUser, editUser, deleteUser } from './admin/editUsers';
import { createTour, editTour, deleteTour } from './admin/editTours';
import { editBooking, deleteBooking } from './admin/editBookings';
import { editReview, deleteReview } from './admin/editReviews';

// DOM ELEMENTS
const logInForm = document.querySelector('.form--login');
const signupForm = document.getElementById('signup-form');
const reviewForm = document.getElementById('review-form');
const otpInForm = document.querySelector('.otp--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const userAdminForm = document.querySelector('.user-form');
const tourAdminForm = document.getElementById('tour-form');
const popupClose = document.querySelector('.popup-close');
const popup = document.querySelector('.popup');
const editUsers = document.querySelectorAll('.editUser-btn');
const editBookings = document.querySelectorAll('.editBooking-btn');
const editReviews = document.querySelectorAll('.editReviews-btn');
const editTours = document.querySelectorAll('.editTours-btn');
const deleteReviews = document.querySelectorAll('.deleteReviews-btn');
const deleteUsers = document.querySelectorAll('.deleteUser-btn');
const deleteBookings = document.querySelectorAll('.deleteBooking-btn');
const deleteTours = document.querySelectorAll('.deleteTours-btn');

if (userAdminForm) {
  userAdminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const role = document.getElementById('role').value;
    const photo = document.getElementById('photo').value;

    createUser(name, email, password, passwordConfirm, role, photo);
  });
}

if (tourAdminForm) {
  tourAdminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const duration = document.getElementById('duration').value;
    const price = document.getElementById('price').value;
    const maxGroupSize = document.getElementById('maxGroupSize').value;
    const difficulty = document.getElementById('difficulty').value;
    const description = document.getElementById('description').value;
    const imageCover = document.getElementById('imageCover').value;
    const images = document.getElementById('images').value;
    const summary = document.getElementById('summary').value;
    const startDates = document.getElementById('startDates').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    createTour(
      name,
      duration,
      price,
      maxGroupSize,
      difficulty,
      description,
      imageCover,
      images,
      summary,
      startDates,
      latitude,
      longitude,
    );
  });
}

if (logInForm) {
  logInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (deleteUsers) {
  deleteUsers.forEach((btn) => {
    btn.addEventListener('click', deleteUser);
  });
}

if (deleteBookings) {
  deleteBookings.forEach((btn) => {
    btn.addEventListener('click', deleteBooking);
  });
}

if (deleteTours) {
  deleteTours.forEach((btn) => {
    btn.addEventListener('click', deleteTour);
  });
}

if (deleteReviews) {
  deleteReviews.forEach((btn) => {
    btn.addEventListener('click', deleteReview);
  });
}

if (popupClose) {
  popupClose.addEventListener('click', () => {
    popup.classList.add('hidden'); // Add a hidden class
    popup.style.display = 'none'; // Hide using inline CSS
  });
}

if (editUsers) {
  // Attach event listener to each edit button
  editUsers.forEach((button) => {
    button.addEventListener('click', (event) => {
      const row = event.target.closest('tr');
      if (!row) return;

      const id = event.target.getAttribute('data-id'); // Get the ID from the button itself
      const name = row.children[0].textContent;
      const email = row.children[1].textContent;
      const role = row.children[2].textContent;

      editUser(id, name, email, role); // Pass data to editUser function
    });
  });
}

if (editBookings) {
  // Attach event listener to each edit button
  editBookings.forEach((button) => {
    button.addEventListener('click', (event) => {
      const row = event.target.closest('tr');
      if (!row) return;

      const id = event.target.getAttribute('data-id'); // Get the ID from the button itself
      const price = row.children[2].textContent;
      const paid = row.children[4].textContent;

      editBooking(id, price, paid);
    });
  });
}

if (editReviews) {
  // Attach event listener to each edit button
  editReviews.forEach((button) => {
    button.addEventListener('click', (event) => {
      const row = event.target.closest('tr');
      if (!row) return;
      const id = event.target.getAttribute('data-id'); // Get the ID from the button itself
      const rating = row.children[2].textContent;
      const review = row.children[3].textContent;

      editReview(id, rating, review);
    });
  });
}

if (editTours) {
  // Attach event listener to each edit button
  editTours.forEach((button) => {
    button.addEventListener('click', (event) => {
      const row = event.target.closest('tr');
      if (!row) return;
      const id = event.target.getAttribute('data-id'); // Get the ID from the button itself
      const duration = row.children[1].textContent;
      const price = row.children[2].textContent;
      const maxGroupSize = row.children[3].textContent;
      const difficulty = row.children[4].textContent;
      editTour(id, duration, price, maxGroupSize, difficulty);
    });
  });
}

if (otpInForm) {
  otpInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const otp = document.getElementById('otp').value;
    console.log('OTP Submitted:', otp);
    verifyOtp(otp);
  });
}

if (signupForm) {
  console.log('Signup form found!');

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Signup form submitted!');

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    if (password !== passwordConfirm) {
      alert('Passwords do not match!');
      return;
    }

    signup(name, email, password, passwordConfirm);
  });
}

if (reviewForm) {
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Review form submitted!');
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;
    const tour = document.getElementById('tour').value;

    reviews(rating, review, tour);
  });
}

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    if (!passwordCurrent || !password || !passwordConfirm) {
      return showAlert('error', 'Please fill in all password fields!');
    }

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save-password').textContent = 'Save Password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    console.log('tourId:', tourId);
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 10);
