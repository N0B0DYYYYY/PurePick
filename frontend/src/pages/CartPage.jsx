import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const CartPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('cart/');
      setItems(response.data);
    } catch (err) {
      setError('Failed to load cart. Please log in and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = async (productId) => {
    try {
      await api.post('cart/remove/', { product_id: productId });
      await loadCart();
    } catch (err) {
      console.error(err);
      setError('Failed to remove item.');
    }
  };

  const checkout = async () => {
    setCheckoutLoading(true);
    setError(null);

    try {
      const response = await api.post('cart/checkout/');
      alert(`Checkout successful! Total paid: $${response.data.total}`);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.product_price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <div className="loading">Loading cart...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">Your cart is empty.</div>
      ) : (
        <div className="cart-table">
          <div className="cart-row header">
            <div>Product</div>
            <div>Price</div>
            <div>Qty</div>
            <div>Total</div>
            <div />
          </div>
          {items.map((item) => (
            <div className="cart-row" key={item.id}>
              <div>{item.product_name}</div>
              <div>${item.product_price}</div>
              <div>{item.quantity}</div>
              <div>${(item.product_price * item.quantity).toFixed(2)}</div>
              <div>
                <button className="btn-secondary" onClick={() => removeItem(item.product)}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-row total">
            <div />
            <div />
            <div />
            <div>
              <strong>Total:</strong> ${total.toFixed(2)}
            </div>
            <div>
              <button className="btn-primary" onClick={checkout} disabled={checkoutLoading}>
                {checkoutLoading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
