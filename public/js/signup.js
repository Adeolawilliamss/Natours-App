/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts'

export const signup = async (name, email, password, passwordConfirm) => {
    try {
      console.log('Sending signup request...'); // ✅ Debugging log
      console.log({ name, email, password, passwordConfirm });
  
      const res = await axios({
        method: 'POST',
        url: '/api/v1/users/signup',
        data: { name, email, password, passwordConfirm },
      });
  
      if (res.data.status === 'success') {
        showAlert('success', 'Account Created! Verification email sent for confirmation.');
  
        setTimeout(() => location.assign('/'), 1500);
      }
    } catch (error) {
      console.log('Signup failed:', error.response?.data); // ✅ Debugging log
      showAlert('error', error.response?.data?.message || 'Create Account failed');
    }
  };
