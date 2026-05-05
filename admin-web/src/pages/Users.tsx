import React, { useState, useEffect } from 'react';
import { Search, Shield, UserMinus, Trash2, UserCheck, ShieldCheck } from 'lucide-react';
import axios from '../axios';
import './Pages.css';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`/users/${id}`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status', err);
    }
  };

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.put(`/users/${id}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role', err);
    }
  };

  const deleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action is permanent.')) {
      try {
        await axios.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user', err);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-actions">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table-card">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td className="font-bold">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'processing' : 'active'}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className={`action-icon ${user.isActive ? 'edit' : 'delete'}`} 
                      title={user.isActive ? "Suspend User" : "Activate User"}
                      onClick={() => toggleStatus(user._id, user.isActive)}
                    >
                      {user.isActive ? <ShieldCheck size={18} color="#22c55e" /> : <Shield size={18} color="#ef4444" />}
                    </button>
                    <button 
                      className="action-icon edit" 
                      title="Promote to Admin / Demote to User"
                      onClick={() => toggleRole(user._id, user.role)}
                    >
                      {user.role === 'admin' ? <UserCheck size={18} color="#FFD700" /> : <Shield size={18} />}
                    </button>
                    <button 
                      className="action-icon delete" 
                      title="Permanently Delete User"
                      onClick={() => deleteUser(user._id)}
                      style={{ marginLeft: '10px' }}
                    >
                      <Trash2 size={18} color="#ef4444" />
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

export default Users;
