import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>CarLog Dashboard</h1>
        <div>
          <span style={{ marginRight: '20px' }}>Welcome, {user?.email}</span>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h2>Your Vehicles</h2>
          <p>Manage your vehicle fleet</p>
          <Link to="/vehicles">
            <button className="btn">View Vehicles</button>
          </Link>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h2>Maintenance Records</h2>
          <p>Track service history</p>
          <Link to="/vehicles">
            <button className="btn">View Records</button>
          </Link>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h2>Upcoming Services</h2>
          <p>Stay on top of maintenance</p>
          <Link to="/vehicles">
            <button className="btn">View Schedule</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;