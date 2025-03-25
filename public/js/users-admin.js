/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

  export const userAdmin = async(name, email, password, passwordConfirm, role, photo) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data:{ name, email, password, passwordConfirm, role, photo },
          });
      
          if (res.data.status === 'success') {
            showAlert('success', 'SUCCESS!');
          }
    } catch (error) {
        console.log('User Create Failed:', error.response?.data); // ✅ Debugging log
        showAlert('error', error.response?.data?.message || 'Create User failed');
    }
  }
