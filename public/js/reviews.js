/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts'

export const reviews = async (rating, review, tour) => {
    try {
      console.log('Sending review request...'); // ✅ Debugging log
      console.log({ rating, review, tour });
  
      const res = await axios({
        method: 'POST',
        url: '/api/v1/reviews/sendReviews',
        data:{ rating, review, tour },
      });
  
      if (res.data.status === 'success') {
        showAlert('success', 'Review successfully sent!');
  
        setTimeout(() => location.assign('/my-reviews'), 1500);
      }
    } catch (error) {
      console.log('Signup failed:', error.response?.data); // ✅ Debugging log
      showAlert('error', error.response?.data?.message || 'Create Ratings failed');
    }
  };
