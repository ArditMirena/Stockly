// StripeWrapper.tsx
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key_here');

interface Props {
  children: React.ReactNode;
}

const StripeWrapper: React.FC<Props> = ({ children }) => (
  <Elements stripe={stripePromise}>{children}</Elements>
);

export default StripeWrapper;
