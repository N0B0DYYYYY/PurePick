import React, { useState, useEffect } from 'react';
import api from '../api/api'; // Import our API client

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use the router URL we created in Django: /api/products/
        const response = await api.get('products/');
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // The empty array [] means this effect runs once when the component mounts

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <h2>Our Products</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '1rem', width: '200px' }}>
            {/* Note: Django REST Framework might not include image URLs by default.
                We'll handle displaying images properly later. */}
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;