import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Product API calls
export const productService = {
  getAllProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  getProductByBarcode: async (barcode) => {
    try {
      const response = await api.get(`/products/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with barcode ${barcode}:`, error);
      throw error;
    }
  },
  
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
  
  updateStock: async (id, quantity, operation) => {
    try {
      const response = await api.put(`/products/${id}/stock`, { quantity, operation });
      return response.data;
    } catch (error) {
      console.error(`Error updating stock for product ${id}:`, error);
      throw error;
    }
  },
  
  updateDiscount: async (id, isDiscounted, discountPercentage) => {
    try {
      const response = await api.put(`/products/${id}/discount`, { isDiscounted, discountPercentage });
      return response.data;
    } catch (error) {
      console.error(`Error updating discount for product ${id}:`, error);
      throw error;
    }
  }
};

// Sale API calls
export const saleService = {
  getAllSales: async () => {
    try {
      const response = await api.get('/sales');
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },
  
  getSaleById: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error);
      throw error;
    }
  },
  
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },
  
  updateSaleStatus: async (id, paymentStatus) => {
    try {
      const response = await api.put(`/sales/${id}/status`, { paymentStatus });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for sale ${id}:`, error);
      throw error;
    }
  },
  
  getDailyReport: async (date) => {
    try {
      const response = await api.get('/sales/report/daily', { params: { date } });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily report:', error);
      throw error;
    }
  }
};

export default api;