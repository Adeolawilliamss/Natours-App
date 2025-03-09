/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './map';
import { login, logout } from './login';
import { signup } from './signup';
import { verifyOtp } from './otp';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

//DOM ELEMENTS
const logInForm = document.querySelector('.form--login');
const signupForm = document.getElementById('signup-form');
const otpInForm = document.querySelector('.otp--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');


if (logInForm) {
  logInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if(otpInForm) {
  otpInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const otp = document.getElementById('otp').value;
    console.log('OTP Submitted:', otp);
    verifyOtp(otp); // Call verifyOtp function
  });
}

if (signupForm) {
  console.log('Signup form found!'); // ✅ Debugging log

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevents form from reloading

    console.log('Signup form submitted!'); // ✅ Debugging log

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
} else {
  console.log('Signup form NOT found!'); // ✅ Debugging log
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
    console.log('tourId:', tourId); // Check if the value is being passed correctly
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 10);
