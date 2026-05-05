import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, Trash2 } from 'lucide-react';
import axios from '../axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Pages.css';

interface Order {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  products: Array<{
    productId: { name: string; price: number };
    quantity: number;
    size: string;
  }>;
  createdAt: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber?: string;
  shippingAddress?: string;
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

  const deleteOrder = async (id: string) => {
    if (window.confirm('Delete this order? This cannot be undone.')) {
      try {
        const token = localStorage.getItem('adminToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/orders/${id}`, config);
        fetchOrders();
      } catch (err) {
        console.error('Error deleting order', err);
      }
    }
  };

  const downloadPDF = (order: Order) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(212, 175, 55); // Gold
    doc.text('TAMIL MEN\'S WEAR', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice: #ORD-${order._id.slice(-6).toUpperCase()}`, 15, 40);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 15, 47);
    
    // Customer Info
    doc.setFontSize(14);
    doc.text('Customer Details', 15, 60);
    doc.setFontSize(11);
    doc.text(`Name: ${order.userId?.name || 'Guest'}`, 15, 67);
    doc.text(`Email: ${order.userId?.email}`, 15, 74);
    doc.text(`Address: ${order.shippingAddress || 'N/A'}`, 15, 81);

    // Order Table
    const tableData = (order.products || []).map((p: any) => [
      p.productId?.name || 'Unknown Item',
      p.size || 'N/A',
      p.quantity,
      `LKR ${p.price?.toLocaleString()}`,
      `LKR ${(p.price * p.quantity).toLocaleString()}`
    ]);

    doc.autoTable({
      startY: 90,
      head: [['Item', 'Size', 'Qty', 'Price', 'Subtotal']],
      body: tableData,
      headStyles: { fillColor: [212, 175, 55] },
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text(`Total Amount: LKR ${order.totalAmount.toLocaleString()}`, 15, finalY + 15);
    doc.text(`Payment Status: ${order.paymentStatus}`, 15, finalY + 22);

    doc.save(`Order_${order._id.slice(-6).toUpperCase()}.pdf`);
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
                <th>Payment</th>
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
                  <td>LKR {order.totalAmount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${order.paymentStatus?.toLowerCase() === 'completed' ? 'active' : 'processing'}`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <select 
                      className={`status-select ${order.orderStatus.toLowerCase().replace(/ /g, '-')}`}
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
                    <button className="action-icon edit" title="View Details" onClick={() => setSelectedOrder(order)}><Eye size={16} /></button>
                    <button className="action-icon edit" title="Download PDF" onClick={() => downloadPDF(order)}><Download size={16} /></button>
                    <button className="action-icon delete" title="Delete Order" onClick={() => deleteOrder(order._id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content order-details-modal">
            <div className="modal-header">
              <h3>Order Details: #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.userId?.name || 'Guest'}</p>
                <p><strong>Email:</strong> {selectedOrder.userId?.email}</p>
                <p><strong>Address:</strong> {selectedOrder.shippingAddress || 'N/A'}</p>
              </div>
              <div className="detail-section">
                <h4>Products</h4>
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Size</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products?.map((p: any, i: number) => (
                      <tr key={i}>
                        <td>{p.productId?.name || 'Unknown Item'}</td>
                        <td>{p.size}</td>
                        <td>{p.quantity}</td>
                        <td>LKR {p.price?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="detail-total">
                <p><strong>Total Amount:</strong> LKR {selectedOrder.totalAmount.toLocaleString()}</p>
                <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => downloadPDF(selectedOrder)}>
                <Download size={18} /> Download Invoice (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
