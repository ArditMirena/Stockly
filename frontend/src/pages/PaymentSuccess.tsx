// src/pages/PaymentSuccess.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@mantine/core';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to admin orders dashboard
    const timer = setTimeout(() => {
      navigate('/admin/orders');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Loader size="xl" variant="bars" />
      <h2>Payment Successful! Redirecting to orders...</h2>
    </div>
  );
};

export default PaymentSuccess;