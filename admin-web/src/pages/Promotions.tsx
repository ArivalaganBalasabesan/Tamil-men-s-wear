import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Tag, Plus, Trash2, Edit2, Search, Filter, Calendar } from 'lucide-react';

interface Promotion {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minPurchaseAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountAmount: 0,
    minPurchaseAmount: 0,
    startDate: '',
    endDate: '',
    isActive: true
  });

  const getTokenConfig = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchPromotions = async () => {
    try {
      const res = await axios.get('/promotions/all', getTokenConfig());
      setPromotions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPromo) {
        await axios.put(`/promotions/${editingPromo._id}`, formData, getTokenConfig());
      } else {
        await axios.post('/promotions', formData, getTokenConfig());
      }
      setShowModal(false);
      setEditingPromo(null);
      fetchPromotions();
    } catch (err) {
      console.error('Error saving promotion:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await axios.delete(`/promotions/${id}`, getTokenConfig());
        fetchPromotions();
      } catch (err) {
        console.error('Error deleting promotion:', err);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Tag size={24} />
          </div>
          <div>
            <h1>Promotions & Discounts</h1>
            <p>Create and manage promo codes for marketing campaigns</p>
          </div>
        </div>
        <button className="add-btn" onClick={() => { setEditingPromo(null); setShowModal(true); }}>
          <Plus size={20} />
          <span>New Promotion</span>
        </button>
      </div>

      <div className="table-filters">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search promo codes..." />
        </div>
        <button className="filter-btn">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Min. Order</th>
              <th>Validity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : promotions.map((promo) => (
              <tr key={promo._id}>
                <td><strong className="promo-code">{promo.code}</strong></td>
                <td>{promo.description}</td>
                <td>
                  <span className="discount-tag">
                    {promo.discountAmount}{promo.discountType === 'percentage' ? '%' : ' ₹'}
                  </span>
                </td>
                <td>₹{promo.minPurchaseAmount}</td>
                <td>
                  <div className="date-info">
                    <Calendar size={14} />
                    <span>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${promo.isActive ? 'success' : 'danger'}`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="edit-btn" onClick={() => { setEditingPromo(promo); setFormData({...promo}); setShowModal(true); }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(promo._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingPromo ? 'Edit Promotion' : 'Add New Promotion'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Promo Code</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. SUMMER50"
                  />
                </div>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select 
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value as any})}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({...formData, discountAmount: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Min. Purchase Amount</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({...formData, minPurchaseAmount: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.startDate.split('T')[0]}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.endDate.split('T')[0]}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the offer..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save Promotion</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
