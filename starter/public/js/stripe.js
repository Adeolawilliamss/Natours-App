/* eslint-disable */
import axios from 'axios';
import { loadStripe } from "@stripe/stripe-js";
import { showAlert } from './alerts'

// Function to load Stripe asynchronously
const getStripe = async () => {
  return await loadStripe('pk_test_51QoVmlBCDE0Avr3IM3u5XtW47zwxqzFYPfCWewlDtoogpHO9MDi0BciGfmEbuZ5UndigpE8b3uthLGfgpEThova500k1X4Pk5v');
};

// Exported function to book a tour
export const bookTour = async (tourId) => {
  try {
    const stripe = await getStripe(); // Ensure Stripe is loaded before using it
    if (!stripe) {
      console.error("Stripe failed to load.");
      return;
    }

    // 1. Get Checkout session from API
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    // console.log('Session:', session.data);

    // 2. Redirect to Stripe checkout
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.error('Error booking tour:', err);
    showAlert('error', err)
  }
};




// export const bookTour = async (tourId) => {
//   //1} Get the Checkout session from the API
//   const session = await axios(
//     `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
//   );
//   console.log(session)

//   //2}Create checkout form + charge credit card
// };
