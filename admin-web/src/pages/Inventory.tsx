import React, { useState, useEffect } from 'react';
import { Search, ArrowUpCircle } from 'lucide-react';
import axios from '../axios';
import './Pages.css';

interface InventoryItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    stock: number;
  };
  stockLevel: number;
  lowStockThreshold: number;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
      const res = await axios.get('/inventory', getTokenConfig());
      setInventory(res.data);
    } catch (err) {
      console.error('Error fetching inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (productId: string, stockLevel?: number, threshold?: number) => {
    try {
      await axios.post('/inventory/update', { 
        product: productId, 
        stockLevel, 
        lowStockThreshold: threshold 
      }, getTokenConfig());
      fetchInventory();
    } catch (err) {
      console.error('Error updating inventory', err);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <th>Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item._id}>
                  <td className="font-bold">{item.product?.name}</td>
                  <td>{item.stockLevel}</td>
                  <td>{item.lowStockThreshold}</td>
                  <td>
                    <span className={`stock-badge ${item.stockLevel <= item.lowStockThreshold ? 'low-stock' : ''}`}>
                      {item.stockLevel <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', marginRight: '8px' }}
                      onClick={() => {
                        const newStock = prompt('Enter new stock quantity:', item.stockLevel.toString());
                        if (newStock !== null) updateInventory(item.product._id, parseInt(newStock), item.lowStockThreshold);
                      }}
                    >
                      <ArrowUpCircle size={14} />
                      <span>Update Stock</span>
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px' }}
                      onClick={() => {
                        const newThreshold = prompt('Enter new alert threshold:', item.lowStockThreshold.toString());
                        if (newThreshold !== null) updateInventory(item.product._id, item.stockLevel, parseInt(newThreshold));
                      }}
                    >
                      <span>Set Threshold</span>
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
