import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutSuccess = () => {
  return (
    <div className="checkout-success">
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase. Your order has been processed successfully.</p>
      <p>You will receive an email confirmation shortly.</p>
      <Link to="/" className="btn-primary">Continue Shopping</Link>
    </div>
  );
};

export default CheckoutSuccess;