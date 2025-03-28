/* eslint-disable */
import axios from 'axios';
import { showAlert } from '../alerts';

export const editBooking = async (id, price, paid) => {
  console.log('Bookings Data:', { id, price, paid });

  // Populate the popup form with user data
  console.log('Hidden Input Found:', document.getElementById('popup-userId'));
  document.getElementById('popup-userId').value = id;
  document.getElementById('popup-price').value = price;
  document.getElementById('popup-paid').value = paid === 'Yes' ? 'Yes' : 'No';

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
  if (window.location.pathname === '/manage-bookings') {
    const form = document.getElementById('bookings-form');
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const id = document.getElementById('popup-userId').value
      const price = document.getElementById('popup-price').value; // Get updated price
      const paid = document.getElementById('popup-paid').value; // Get updated paid value
      console.log('Form Submission Data:', { id, price, paid }); // Debugging

      try {
        const res = await axios.patch(`/api/v1/bookings/updateBooking/${id}`, {
          price,
          paid,
        });

        if (res.data.status === 'success') {
          showAlert('success', 'Bookings Successfully Updated!');
          setTimeout(() => location.assign('/manage-bookings'), 1500);

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

export const deleteBooking = async (event) => {
  try {
    const id = event.target.dataset.id; // Get user ID from button's data attribute
    if (!id) return console.error("No user ID found!");

    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/bookings/${id}`
    });

    if (res.status === 204) {
      showAlert('success', 'Booking Deleted');
      setTimeout(() => location.assign('/manage-bookings'), 1500);
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error deleting user! Try again.');
  }
};
