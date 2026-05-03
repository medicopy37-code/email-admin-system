import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import UserLogin from './components/UserLogin';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'user'

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedUser = localStorage.getItem(savedRole === 'admin' ? 'admin' : 'user');

    if (token && savedRole && savedUser) {
      setIsAuthenticated(true);
      setRole(savedRole);
      setUserData(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userRole, user) => {
    setIsAuthenticated(true);
    setRole(userRole);
    setUserData(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setRole(null);
    setUserData(null);
  };

  if (!isAuthenticated) {
    return (
      <div>
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: 'white',
          margin: '20px auto',
          maxWidth: '450px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setLoginType('admin')}
              className={`btn ${loginType === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Admin Login
            </button>
            <button
              onClick={() => setLoginType('user')}
              className={`btn ${loginType === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            >
              User Login
            </button>
          </div>
        </div>

        {loginType === 'admin' ? (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        ) : (
          <UserLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    );
  }

  if (role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (role === 'user') {
    return <UserDashboard onLogout={handleLogout} user={userData} />;
  }

  return null;
}

export default App;
