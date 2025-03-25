/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { userAdmin } from './users-admin';
import { reviews } from './reviews';
import { verifyOtp } from './otp';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { editUser } from './editUsers';

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
const editButtons = document.querySelectorAll('.edit-btn');

console.log('Edit buttons found:', editButtons.length); // Debugging

if (userAdminForm) {
  userAdminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const role = document.getElementById('role').value;
    const photo = document.getElementById('photo').value;

    userAdmin(name, email, password, passwordConfirm, role, photo);
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

if(editButtons) {
    // Attach event listener to each edit button
editButtons.forEach((button) => {
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
