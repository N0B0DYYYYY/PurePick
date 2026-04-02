import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutCancel = () => {
  return (
    <div className="checkout-cancel">
      <h2>Payment Cancelled</h2>
      <p>Your payment was cancelled. No charges were made.</p>
      <p>You can try again or continue shopping.</p>
      <Link to="/cart" className="btn-primary">Return to Cart</Link>
    </div>
  );
};

export default CheckoutCancel;