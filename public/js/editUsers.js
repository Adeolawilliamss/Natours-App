/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const editUser = async (id, name, email, role) => {
  console.log('User Data:', { id, email, name, role });

  // Populate the popup form with user data
  console.log('Hidden Input Found:', document.getElementById('popup-userId'));
  document.getElementById('popup-userId').value = id;
  document.getElementById('popup-name').value = name;
  document.getElementById('popup-email').value = email;
  document.getElementById('popup-role').value = role;

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
  const form = document.getElementById('user-form');
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const id = document.getElementById('popup-userId').value;
    const role = document.getElementById('popup-role').value; // Get updated role
    console.log('Form Submission Data:', { id, role }); // Debugging

    try {
      const res = await axios.patch(`/api/v1/users/updateUser/${id}`, { role });

      if (res.data.status === 'success') {
        showAlert('success', 'User Role Successfully Updated!');
        setTimeout(() => location.assign('/manage-users'), 1500);

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
});
