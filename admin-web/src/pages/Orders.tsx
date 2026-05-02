import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download } from 'lucide-react';
import axios from '../axios';
import './Pages.css';

interface Order {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  createdAt: string;
  totalAmount: number;
  orderStatus: string;
  trackingNumber?: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/orders', config);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/orders/${id}/status`, { status }, config);
      fetchOrders();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const updateTracking = async (id: string, trackingNumber: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/orders/${id}/status`, { trackingNumber }, config);
      fetchOrders();
    } catch (err) {
      console.error('Error updating tracking', err);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-actions">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-secondary">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      <div className="data-table-card">
        {loading ? (
          <div className="loading-state">Loading orders...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tracking Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className="font-bold">#{order._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="customer-info">
                      <span className="font-bold">{order.userId?.name || 'Guest'}</span>
                      <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>{order.userId?.email}</span>
                    </div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>₹{order.totalAmount.toLocaleString()}</td>
                  <td>
                    <select 
                      className={`status-select ${order.orderStatus.toLowerCase()}`}
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      defaultValue={order.trackingNumber || ''} 
                      placeholder="Enter Tracking ID/Location"
                      onBlur={(e) => updateTracking(order._id, e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff', width: '150px' }}
                    />
                  </td>
                  <td className="actions-cell">
                    <button className="action-icon edit"><Eye size={16} /></button>
                    <button className="action-icon edit"><Download size={16} /></button>
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

export default Orders;
