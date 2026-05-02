import React, { useState, useEffect } from 'react';
import { Search, ArrowUpCircle } from 'lucide-react';
import axios from '../axios';
import './Pages.css';

interface Product {
  _id: string;
  name: string;
  stock: number;
}

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const getTokenConfig = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/products', getTokenConfig());
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, amount: number) => {
    try {
      await axios.put(`/admin/stock/${id}`, { stock: amount }, getTokenConfig());
      fetchInventory();
    } catch (err) {
      console.error('Error updating stock', err);
    }
  };

  const filteredInventory = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-actions">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table-card">
        {loading ? (
          <div className="loading-state">Loading inventory...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(product => (
                <tr key={product._id}>
                  <td className="font-bold">{product.name}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`stock-badge ${product.stock < 10 ? 'low-stock' : ''}`}>
                      {product.stock < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px' }}
                      onClick={() => {
                        const newStock = prompt('Enter new stock quantity:', product.stock.toString());
                        if (newStock !== null) updateStock(product._id, parseInt(newStock));
                      }}
                    >
                      <ArrowUpCircle size={14} />
                      <span>Update Stock</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;
