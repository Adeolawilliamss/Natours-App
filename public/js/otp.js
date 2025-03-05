/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const verifyOtp = async (otp) => {
  try {
    const email = localStorage.getItem('userEmail'); // ✅ Retrieve email

    if (!email) {
      showAlert('error', 'Email not found. Please log in again.');
      return;
    }

    const res = await axios.post('/api/v1/users/verify-otp', { email, otp });

    if (res.data.status === 'success') {
      showAlert('success', 'OTP verified! Logging in...');
      localStorage.removeItem('userEmail'); // ✅ Remove email after verification
      setTimeout(() => location.assign('/'), 1500);
    }
  } catch (error) {
    showAlert('error', error.response?.data?.message || 'Something went wrong');
    console.error('OTP Verification Error:', error);
  }
};
