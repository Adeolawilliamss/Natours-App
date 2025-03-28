/* eslint-disable */
import axios from 'axios';
import { showAlert } from '../alerts';

export const editReview = async (id, rating, review) => {
  console.log('Bookings Data:', { id, rating, review });

  // Populate the popup form with user data
  console.log('Hidden Input Found:', document.getElementById('popup-userId'));
  document.getElementById('popup-userId').value = id;
  document.getElementById('popup-rating').value = rating;
  document.getElementById('popup-review').value = review;

  // Show the popup
  const popup = document.getElementById('popup');
  if (popup) {
    popup.classList.remove('hidden');
    popup.style.display = 'block';
    console.log('Popup opened!');
  } else {
    console.error('Popup element not found!');
  }
};

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/manage-reviews') {
    const form = document.getElementById('reviews-form');
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const id = document.getElementById('popup-userId').value
      const rating = document.getElementById('popup-rating').value; // Get updated rating value
      const review = document.getElementById('popup-review').value; // Get updated review 
      console.log('Form Submission Data:', { id, rating, review  }); // Debugging

      try {
        const res = await axios.patch(`/api/v1/reviews/${id}`, {
          rating,
          review,
        });

        if (res.data.status === 'success') {
          showAlert('success', 'Bookings Successfully Updated!');
          setTimeout(() => location.assign('/manage-reviews'), 1500);

          // Close popup after successful update
          const popup = document.getElementById('popup');
          if (popup) {
            popup.classList.add('hidden');
            popup.style.display = 'none';
          }
        }
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    });
  }
});

export const deleteReview = async (event) => {
  try {
    const id = event.target.dataset.id; // Get user ID from button's data attribute
    if (!id) return console.error("No user ID found!");

    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${id}`
    });

    if (res.status === 204) {
      showAlert('success', 'Reviews Deleted');
      setTimeout(() => location.assign('/manage-reviews'), 1500);
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error deleting user! Try again.');
  }
};
