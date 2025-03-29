 /* eslint-disable */
 import axios from 'axios';
 import { showAlert } from './alerts'

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logging In..');

      setTimeout(() => location.assign('/'), 1500);
    }
  } catch (error) {
    console.log('Error response:', error.response?.data); // ✅ Log error response
    showAlert('error', error.response?.data?.message || 'Login failed');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};


//  import axios from 'axios';
//  import { showAlert } from './alerts'

// export const login = async (email, password) => {
//   try {
//     const res = await axios({
//       method: 'POST',
//       url: '/api/v1/users/login',
//       data: { email, password },
//     });

//     if (res.data.status === 'success') {
//       showAlert('success', 'OTP sent! Redirecting to OTP page...');

//         // ✅ Store email in localStorage for OTP verification
//         localStorage.setItem('userEmail', email);

//       // ✅ Redirect using the provided URL from the backend
//       window.setTimeout(() => {
//         window.location.href = res.data.redirectUrl || '/otp'; 
//       }, 1500);
//     }
//   } catch (error) {
//     console.log('Error response:', error.response?.data); // ✅ Log error response
//     showAlert('error', error.response?.data?.message || 'Login failed');
//   }
// };

// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: 'GET',
//       url: '/api/v1/users/logout'
//     });
//     if ((res.data.status = 'success')) location.reload(true);
//   } catch (err) {
//     console.log(err.response);
//     showAlert('error', 'Error logging out! Try again.');
//   }
// };