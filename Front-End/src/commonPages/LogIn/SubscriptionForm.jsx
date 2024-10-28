// SubscriptionPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Subscription.css'

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51QCIq3LBe91ZHSwh420acWwdAaGqIyaZQiM8mm5zQdutHTjVPKvPnLszmsvvCyZsOido21bArsG4746K1EZUHuVk00GgoH8P2f');

const SubscriptionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  
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
      },
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
          "Content-Type": "application/json"
        }
      });

      setMessage(response.data.message || 'Subscription successful!');

      // Retrieve updated user details after subscription
      const access_token = localStorage.getItem('access_token');
      const userResponse = await axios.get(`http://127.0.0.1:8000/api/users/${email}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Store user details in localStorage
      localStorage.setItem('user_details', JSON.stringify({
        id: userResponse.data.id,
        first_name: userResponse.data.first_name,
        last_name: userResponse.data.last_name,
        is_subscribed: userResponse.data.is_subscribed,
        stripe_customer_id: userResponse.data.stripe_customer_id,
        email: userResponse.data.email,
      }));

      setIsProcessing(false);

      // Redirect to success page or dashboard
      navigate('/dashboard');
    } catch (error) {
      setMessage('Subscription failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="subscription-form-container">
      <h2 className="subscription-title">Subscribe to Our Service</h2>
      <h3 className="plan-name">Premium Monthly Plan</h3>
        <p className="plan-price">Price: $20.00 USD</p>
        <p className="plan-interval">Billing Interval: Monthly</p>
        <p className="plan-description">
        This plan offers premium monthly access to all features and Question generation.
        </p>
      <form className="subscription-form" onSubmit={handleSubscription}>
        <CardElement className="stripe-card-input" />
        <button className="subscribe-button" type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : 'Subscribe'}
        </button>
      </form>
      {message && <div className="subscription-message">{message}</div>}
    </div>
  );
};

const SubscriptionPage = () => (
  <Elements stripe={stripePromise}>
    <SubscriptionForm />
  </Elements>
);

export default SubscriptionPage;
