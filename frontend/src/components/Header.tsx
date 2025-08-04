import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import logo from '../images/logo.png';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't show header on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header style={{
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e0e0e0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '150px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          textDecoration: 'none'
        }}>
          <img 
            src={logo} 
            alt="CarLog Logo" 
            style={{ 
              height: '150px',
              width: 'auto'
            }} 
          />
        </Link>

        {/* Navigation */}
        {user ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/vehicles" style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/vehicles' ? '#4CAF50' : '#333',
              fontWeight: location.pathname === '/vehicles' ? 'bold' : 'normal'
            }}>
              Vehicles
            </Link>
            <Link to="/maintenance" style={{ 
              textDecoration: 'none', 
              color: location.pathname.startsWith('/maintenance') ? '#4CAF50' : '#333',
              fontWeight: location.pathname.startsWith('/maintenance') ? 'bold' : 'normal'
            }}>
              Maintenance
            </Link>
            <Link to="/recommendations" style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/recommendations' ? '#4CAF50' : '#333',
              fontWeight: location.pathname === '/recommendations' ? 'bold' : 'normal'
            }}>
              Recommendations
            </Link>
            <Link to="/admin" style={{ 
              textDecoration: 'none', 
              color: location.pathname.startsWith('/admin') ? '#4CAF50' : '#333',
              fontWeight: location.pathname.startsWith('/admin') ? 'bold' : 'normal'
            }}>
              Admin
            </Link>
            <Link to="/profile" style={{ 
              borderLeft: '1px solid #e0e0e0', 
              paddingLeft: '20px',
              textDecoration: 'none',
              color: location.pathname === '/profile' ? '#4CAF50' : '#666',
              fontSize: '14px',
              fontWeight: location.pathname === '/profile' ? 'bold' : 'normal'
            }}>
              {user.email}
            </Link>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              Logout
            </button>
          </nav>
        ) : (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/login" style={{ 
              textDecoration: 'none', 
              color: '#333' 
            }}>
              Login
            </Link>
            <Link to="/register">
              <button className="btn" style={{ fontSize: '14px', padding: '8px 16px' }}>
                Get Started
              </button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;