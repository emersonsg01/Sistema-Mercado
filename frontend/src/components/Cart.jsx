import { useState, useEffect } from 'react';
import { saleService } from '../services/api';

const Cart = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cardLastDigits, setCardLastDigits] = useState('');
  const [installments, setInstallments] = useState(1);

  // Calculate total whenever items change
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => {
      const itemPrice = item.isDiscounted ? item.discountedPrice : item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
    setTotal(newTotal);
  }, [items]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Carrinho vazio. Adicione produtos antes de finalizar.');
      return;
    }

    setProcessing(true);
    setError(null);
    
    try {
      // Format items for the API
      const saleItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        discountAmount: item.isDiscounted ? (item.price - item.discountedPrice) * item.quantity : 0
      }));

      // Create sale data object
      const saleData = {
        items: saleItems,
        paymentMethod,
        cardLastDigits: paymentMethod !== 'cash' ? cardLastDigits : null,
        installments: paymentMethod === 'credit_card' ? installments : 1
      };

      // Call API to create sale
      const result = await saleService.createSale(saleData);
      
      setSuccess(true);
      onClearCart(); // Clear the cart after successful checkout
      
      // Reset form
      setPaymentMethod('cash');
      setCardLastDigits('');
      setInstallments(1);
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Erro ao processar venda. Tente novamente.');
      console.error('Checkout error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="cart-container">
      <h2>Carrinho de Compras</h2>
      
      {items.length === 0 ? (
        <div className="empty-cart">Carrinho vazio</div>
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">
                    {item.isDiscounted ? (
                      <>
                        <span className="original-price">R$ {item.price.toFixed(2)}</span>
                        <span className="discounted-price">R$ {item.discountedPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span>R$ {item.price.toFixed(2)}</span>
                    )}
                  </p>
                </div>
                
                <div className="item-actions">
                  <button 
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    Remover
                  </button>
                </div>
                
                <div className="item-subtotal">
                  Subtotal: R$ {((item.isDiscounted ? item.discountedPrice : item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="total">Total: R$ {total.toFixed(2)}</div>
            
            <div className="payment-options">
              <h3>Forma de Pagamento</h3>
              
              <div className="payment-methods">
                <label>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cash" 
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')} 
                  />
                  Dinheiro
                </label>
                
                <label>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="credit_card" 
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')} 
                  />
                  Cartão de Crédito
                </label>
                
                <label>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="debit_card" 
                    checked={paymentMethod === 'debit_card'}
                    onChange={() => setPaymentMethod('debit_card')} 
                  />
                  Cartão de Débito
                </label>
              </div>
              
              {paymentMethod !== 'cash' && (
                <div className="card-details">
                  <div className="form-group">
                    <label>Últimos 4 dígitos do cartão:</label>
                    <input 
                      type="text" 
                      maxLength="4" 
                      pattern="\d{4}" 
                      value={cardLastDigits}
                      onChange={(e) => setCardLastDigits(e.target.value.replace(/\D/g, ''))}
                      placeholder="0000"
                    />
                  </div>
                  
                  {paymentMethod === 'credit_card' && (
                    <div className="form-group">
                      <label>Parcelas:</label>
                      <select 
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                          <option key={num} value={num}>{num}x</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="checkout-actions">
              <button 
                className="clear-btn"
                onClick={onClearCart}
                disabled={processing}
              >
                Limpar Carrinho
              </button>
              
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={processing || items.length === 0}
              >
                {processing ? 'Processando...' : 'Finalizar Compra'}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Venda realizada com sucesso!</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;