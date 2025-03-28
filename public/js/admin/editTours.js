/* eslint-disable */
import axios from 'axios';
import { showAlert } from '../alerts';

export const createTour = async (
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
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/tours',
      data: {
        name,
        duration: Number(duration),
        price: Number(price),
        maxGroupSize: Number(maxGroupSize),
        difficulty,
        description,
        imageCover, // This should be the filename or path. For file uploads, you'll need to use multer.
        images,     // Same as above.
        summary,
        // If startDates is provided, wrap it in an array of objects. (Here we assume one date for simplicity)
        startDates: startDates ? [{ date: startDates }] : undefined,
        startLocation: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)],
        },
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'SUCCESS!');
      setTimeout(() => location.assign('/manage-tours'), 1500);
    }
  } catch (error) {
    console.log('Tour Create Failed:', error.response?.data);
    showAlert('error', error.response?.data?.message || 'Create Tour failed');
  }
};

export const editTour = async (
  id,
  duration,
  price,
  maxGroupSize,
  difficulty,
) => {
  console.log('Tour Data:', { id, duration, price, maxGroupSize, difficulty });

  // Populate the popup form with tour data
  document.getElementById('popup-tourId').value = id;
  document.getElementById('popup-duration').value = duration;
  document.getElementById('popup-price').value = price;
  document.getElementById('popup-group-size').value = maxGroupSize;
  document.getElementById('popup-difficulty').value = difficulty;

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
  if (window.location.pathname === '/manage-tours') {
    const form = document.getElementById('popup-tour-form');
    if (form) {
      form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Get updated values and convert to proper types
        const id = document.getElementById('popup-tourId').value;
        const duration = Number(
          document.getElementById('popup-duration').value,
        );
        const price = Number(document.getElementById('popup-price').value);
        const maxGroupSize = Number(
          document.getElementById('popup-group-size').value,
        );
        const difficulty = document.getElementById('popup-difficulty').value;

        try {
          const res = await axios.patch(`/api/v1/tours/${id}`, {
            duration,
            price,
            maxGroupSize,
            difficulty,
          });

          if (res.data.status === 'success') {
            showAlert('success', 'Tour Successfully Updated!');
            setTimeout(() => location.assign('/manage-tours'), 1500);

            // Close popup after successful update
            const popup = document.getElementById('popup');
            if (popup) {
              popup.classList.add('hidden');
              popup.style.display = 'none';
            }
          }
        } catch (error) {
          console.error('Error updating tour:', error);
        }
      });
    }
  }
});

export const deleteTour = async (event) => {
  try {
    const id = event.target.dataset.id; // Get user ID from button's data attribute
    if (!id) return console.error('No user ID found!');

    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${id}`,
    });

    if (res.status === 204) {
      showAlert('success', 'Tour Deleted');
      setTimeout(() => location.assign('/manage-tours'), 1500);
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error deleting tours! Try again.');
  }
};
