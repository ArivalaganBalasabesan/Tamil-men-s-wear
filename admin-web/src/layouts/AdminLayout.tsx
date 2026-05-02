import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Layers, 
  Warehouse, 
  LogOut,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-tamil">தமிழ்</span>
            <div className="logo-text">
              <span className="brand">ADMIN</span>
              <span className="version">v1.0</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
            <ChevronRight size={14} className="chevron" />
          </NavLink>
          
          <div className="nav-group">MANAGEMENT</div>
          
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Package size={20} />
            <span>Products</span>
            <ChevronRight size={14} className="chevron" />
          </NavLink>
          
          <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <ShoppingCart size={20} />
            <span>Orders & Tracking</span>
            <ChevronRight size={14} className="chevron" />
          </NavLink>
          
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={20} />
            <span>Users</span>
            <ChevronRight size={14} className="chevron" />
          </NavLink>
          
          <NavLink to="/categories" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Layers size={20} />
            <span>Categories</span>
            <ChevronRight size={14} className="chevron" />
          </NavLink>
          
          <NavLink to="/inventory" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Warehouse size={20} />
            <span>Inventory</span>
            <ChevronRight size={14} className="chevron" />
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-search">
            <Search size={18} />
            <input type="text" placeholder="Global search..." />
          </div>
          
          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.name || 'Admin User'}</span>
                <span className="user-role">{user?.role || 'Administrator'}</span>
              </div>
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
