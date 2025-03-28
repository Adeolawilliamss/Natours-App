/* eslint-disable */
import axios from 'axios';
import { showAlert } from '../alerts'

export const createUser = async (
  name,
  email,
  password,
  passwordConfirm,
  role,
  photo,
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: { name, email, password, passwordConfirm, role, photo },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'SUCCESS!');
    }
  } catch (error) {
    console.log('User Create Failed:', error.response?.data); // ✅ Debugging log
    showAlert('error', error.response?.data?.message || 'Create User failed');
  }
};

export const editUser = async (id, name, email, role) => {
  console.log('User Data:', { id, email, name, role });

  // Populate the popup form with user data
  document.getElementById('popup-userId').value = id;
  document.getElementById('popup-name').value = name;
  document.getElementById('popup-email').value = email;
  document.getElementById('popup-role').value = role;

  // Show the popup
  const popup = document.getElementById('popup');
  if (popup) {
    popup.classList.remove('hidden');
    popup.style.display = 'block';
  }
};

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/manage-users') {
    const form = document.getElementById('user-form');
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const id = document.getElementById('popup-userId').value;
    const role = document.getElementById('popup-role').value; // Get updated role

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
  }
});

export const deleteUser = async (event) => {
  try {
    const id = event.target.dataset.id; // Get user ID from button's data attribute
    if (!id) return console.error("No user ID found!");

    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/users/${id}`
    });

    if (res.status === 204) {
      showAlert('success', 'User Deleted');
      setTimeout(() => location.assign('/manage-users'), 1500);
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error deleting user! Try again.');
  }
};
