import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51QCIq3LBe91ZHSwh420acWwdAaGqIyaZQiM8mm5zQdutHTjVPKvPnLszmsvvCyZsOido21bArsG4746K1EZUHuVk00GgoH8P2f');

const SubscriptionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscription = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !email) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    try {
      // Create a Stripe token from card details
      const { token } = await stripe.createToken(cardElement);
      
      // Send payment and subscription details to backend
      const response = await axios.post('http://127.0.0.1:8000/api/subscription/create/', {
        email,
        stripe_token: token.id,
      });

      setMessage(response.data.message || 'Subscription successful!');
      setIsProcessing(false);

      // Redirect to success page or dashboard
      navigate('/');
    } catch (error) {
      setMessage('Subscription failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="subscription-form">
      <h2>Subscribe to Our Service</h2>
      <form onSubmit={handleSubscription}>
        <CardElement />
        <button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : 'Subscribe'}
        </button>
      </form>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

const SubscriptionPage = () => (
  <Elements stripe={stripePromise}>
    <SubscriptionForm />
  </Elements>
);

export default SubscriptionPage;
