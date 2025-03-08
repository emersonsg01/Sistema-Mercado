import { useState } from 'react';
import './App.css';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { productService } from './services/api';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  
  // Handle product selection from the product list
  const handleSelectProduct = (product) => {
    addProductToCart(product);
  };

  // Handle barcode input submission
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const product = await productService.getProductByBarcode(barcodeInput);
      addProductToCart(product);
      setBarcodeInput('');
    } catch (error) {
      console.error('Error finding product by barcode:', error);
      alert('Produto não encontrado. Verifique o código de barras.');
    }
  };

  // Add product to cart
  const addProductToCart = (product) => {
    setCartItems(prevItems => {
      // Check if product is already in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already exists in cart
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Add new product to cart
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (productId, newQuantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const handleRemoveItem = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Clear cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="pos-system">
      <header className="header">
        <h1>Sistema de Caixa de Supermercado</h1>
        <form onSubmit={handleBarcodeSubmit} className="barcode-form">
          <input
            type="text"
            placeholder="Escanear código de barras"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="barcode-input"
          />
          <button type="submit" className="scan-button">Buscar</button>
        </form>
      </header>
      
      <main className="main-content">
        <div className="product-section">
          <h2>Produtos</h2>
          <ProductList onSelectProduct={handleSelectProduct} />
        </div>
        
        <div className="cart-section">
          <Cart 
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
