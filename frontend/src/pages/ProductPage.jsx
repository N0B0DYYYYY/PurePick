import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`products/${id}/`);
        setProduct(response.data);
      } catch (err) {
        setError('Product not found.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const addToCart = async () => {
    setAdding(true);
    setError(null);
    try {
      await api.post('cart/add/', { product_id: id, quantity: 1 });
      navigate('/cart');
    } catch (err) {
      setError('Failed to add to cart. Please login and try again.');
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="product-page">
      <div className="product-detail">
        <div className="product-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="placeholder">No image available</div>
          )}
        </div>
        <div className="product-info">
          <h2>{product.name}</h2>
          <p className="product-price">${product.price}</p>
          <p className="product-description">{product.description}</p>
          <p>
            <strong>Brand:</strong> {product.brand}
          </p>
          <p>
            <strong>Color:</strong> {product.color}
          </p>
          <p>
            <strong>Size:</strong> {product.size}
          </p>

          <button className="btn-primary" onClick={addToCart} disabled={adding}>
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
