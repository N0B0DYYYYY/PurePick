import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // Import our API client

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (query = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (query) params.search = query;

      const response = await api.get('products/', { params });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products.');
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(search);
  }, [search]);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiSearching(true);
    setError(null);

    try {
      // In the backend we treat this the same as a normal search.
      // In a more advanced version, this could call an AI service.
      await fetchProducts(aiQuery);
      setSearch(aiQuery);
    } catch (err) {
      setError('AI search failed. Try again later.');
      console.error(err);
    } finally {
      setAiSearching(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('cart/add/', { product_id: productId, quantity: 1 });
      alert('Added to cart!');
    } catch (err) {
      console.error(err);
      setError('Failed to add item to cart. Please login and try again.');
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>PurePick</h1>
          <p>Discover curated shoes, apparel and accessories.</p>

          <div className="search-bar">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products, brands, styles..."
              aria-label="Search products"
            />
            <button onClick={() => fetchProducts(search)}>Search</button>
          </div>

          <div className="ai-helper">
            <label htmlFor="ai-search">Need a hand finding something?</label>
            <div className="ai-search">
              <input
                id="ai-search"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. 'black running shoes under $100'"
              />
              <button onClick={handleAiSearch} disabled={aiSearching}>
                {aiSearching ? 'Thinking...' : 'Ask AI'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}

      <section className="products-grid">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found. Try another search.</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <div
                className="product-image-container"
                onClick={() => navigate(`/product/${product.id}`)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => (e.key === 'Enter' ? navigate(`/product/${product.id}`) : null)}
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-image" />
                ) : (
                  <div className="product-image placeholder">No image</div>
                )}
              </div>
              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price}</p>
                <div className="product-actions">
                  <button className="btn-secondary" onClick={() => navigate(`/product/${product.id}`)}>
                    View
                  </button>
                  <button className="btn-primary" onClick={() => addToCart(product.id)}>
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default HomePage;
