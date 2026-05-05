import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Award, TrendingUp, Users, RefreshCw, Star } from 'lucide-react';

interface LoyaltyUser {
  _id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
}

const Loyalty: React.FC = () => {
  const [users, setUsers] = useState<LoyaltyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoints: 0,
    activeMembers: 0,
    pointValue: '1 Point = LKR 1'
  });

  const getTokenConfig = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users', getTokenConfig());
      // Filter only customers (no admins)
      const loyaltyUsers = res.data.filter((u: any) => u.role !== 'admin');
      setUsers(loyaltyUsers);
      
      const total = loyaltyUsers.reduce((acc: number, curr: any) => acc + (curr.loyaltyPoints || 0), 0);
      setStats({
        totalPoints: total,
        activeMembers: loyaltyUsers.length,
        pointValue: '1 Point = LKR 1'
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching loyalty data:', err);
      setLoading(false);
    }
  };

  const updatePoints = async (id: string) => {
    const newPoints = prompt('Enter points to add/deduct (use negative for deduction):', '0');
    if (newPoints !== null && !isNaN(parseInt(newPoints))) {
      const reason = prompt('Enter reason for adjustment:', 'Customer Service Reward');
      if (reason === null) return;

      const pointsVal = Math.abs(parseInt(newPoints));
      const type = parseInt(newPoints) >= 0 ? 'Earned' : 'Redeemed';

      try {
        await axios.post('/loyalty/adjust', { 
          userId: id, 
          points: pointsVal, 
          type, 
          description: reason 
        }, getTokenConfig());
        fetchData();
        alert(`Successfully ${type === 'Earned' ? 'added' : 'deducted'} ${pointsVal} points.`);
      } catch (err: any) {
        console.error('Error updating points:', err);
        const status = err.response?.status;
        const msg = err.response?.data?.message || 'Failed to update points. Please ensure the backend is fully deployed.';
        alert(`Error ${status || 'Network'}: ${msg}`);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Award size={24} />
          </div>
          <div>
            <h1>Loyalty Program</h1>
            <p>Monitor customer reward points and engagement levels</p>
          </div>
        </div>
        <button className="add-btn" onClick={fetchData} disabled={loading}>
          <RefreshCw size={20} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Star size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Points Awarded</span>
            <span className="stat-value">{stats.totalPoints.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Members</span>
            <span className="stat-value">{stats.activeMembers}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Point Value</span>
            <span className="stat-value">{stats.pointValue}</span>
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <div className="table-title">Customer Point Balance</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email Address</th>
              <th>Points Balance</th>
              <th>Member Tier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : users.map((user) => (
              <tr key={user._id}>
                <td><strong>{user.name}</strong></td>
                <td>{user.email}</td>
                <td>
                  <span className="points-badge">
                    {user.loyaltyPoints} PTS
                  </span>
                </td>
                <td>
                  <span className={`tier-badge ${user.loyaltyPoints > 1000 ? 'gold' : user.loyaltyPoints > 500 ? 'silver' : 'bronze'}`}>
                    {user.loyaltyPoints > 1000 ? 'Gold Member' : user.loyaltyPoints > 500 ? 'Silver Member' : 'Bronze Member'}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => updatePoints(user._id)}>Edit Points</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Loyalty;
