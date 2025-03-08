import { useState, useEffect } from 'react';
import { productService } from '../services/api';

const ProductList = ({ onSelectProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar produtos. Por favor, tente novamente.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  return (
    <div className="product-list-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar produto por nome ou código de barras"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {loading ? (
        <div className="loading">Carregando produtos...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => onSelectProduct(product)}
              >
                <h3>{product.name}</h3>
                <p className="barcode">Código: {product.barcode}</p>
                <p className="price">
                  {product.isDiscounted ? (
                    <>
                      <span className="original-price">R$ {product.price.toFixed(2)}</span>
                      <span className="discounted-price">R$ {product.discountedPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span>R$ {product.price.toFixed(2)}</span>
                  )}
                </p>
                <p className="stock">Estoque: {product.stock} unidades</p>
              </div>
            ))
          ) : (
            <div className="no-products">Nenhum produto encontrado</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;