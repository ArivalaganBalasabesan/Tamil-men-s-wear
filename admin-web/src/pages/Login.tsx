import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from '../axios';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.user.role === 'admin') {
        login(res.data.user, res.data.token);
      } else {
        setError('Access denied. Admin only.');
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // In a real app, you'd send this code/token to your backend to verify
        // For now, we'll fetch user info directly for the demo
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        const googleUser = userInfo.data;
        
        // Check if user exists as admin in backend
        const res = await axios.post('/auth/google', {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub
        });

        if (res.data.user.role === 'admin') {
          login(res.data.user, res.data.token);
        } else {
          setError('Access denied. This Google account is not an admin.');
        }
      } catch (err) {
        setError('Google login failed.');
      }
    },
    onError: () => setError('Google login failed.')
  });

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="brand-tamil">தமிழ்</span>
          <h1>Admin Portal</h1>
          <p>Please enter your credentials to continue</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@tamilmw.com"
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="login-btn">Sign In</button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={() => googleLogin()} className="google-btn">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
