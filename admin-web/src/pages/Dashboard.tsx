import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import axios from '../axios';
import './Pages.css';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  usersCount: number;
  lowStockCount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        axios.get('/admin/stats', config),
        axios.get('/orders', config),
        axios.get('/products', config)
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
      setTopProducts(productsRes.data.slice(0, 3));
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <h3 className="stat-value">₹{stats?.totalRevenue?.toLocaleString()}</h3>
            <span className="stat-change up">
              <ArrowUpRight size={14} />
              +12.5%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <h3 className="stat-value">{stats?.totalOrders}</h3>
            <span className="stat-change up">
              <ArrowUpRight size={14} />
              +8.2%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Customers</span>
            <h3 className="stat-value">{stats?.usersCount}</h3>
            <span className="stat-change up">
              <ArrowUpRight size={14} />
              +5.4%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon low-stock">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Low Stock Items</span>
            <h3 className="stat-value">{stats?.lowStockCount}</h3>
            <span className="stat-change down">
              <ArrowDownRight size={14} />
              -2.1%
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="content-card recent-orders">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button className="text-btn">View All</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6).toUpperCase()}</td>
                  <td>{order.userId?.name || 'Guest'}</td>
                  <td>
                    <span className={`badge ${order.orderStatus.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>₹{order.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="content-card top-products">
          <div className="card-header">
            <h3>Popular Products</h3>
          </div>
          <div className="product-list">
            {topProducts.map(product => (
              <div key={product._id} className="product-item">
                <div className="product-img">
                   {product.images[0] ? <img src={product.images[0]} alt="" /> : <div className="placeholder"></div>}
                </div>
                <div className="product-details">
                  <h4>{product.name}</h4>
                  <p>{product.category}</p>
                </div>
                <div className="product-meta">
                  <span className="price">₹{product.price}</span>
                  <span className="sales">{product.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
