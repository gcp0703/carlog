import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { UserWithVehicleCount } from '../types';
import { adminService } from '../services/api';

const Admin: React.FC = () => {
  const [users, setUsers] = useState<UserWithVehicleCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await adminService.getUsers();
      setUsers(userData);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'admin':
        return { backgroundColor: '#dc3545', color: 'white' };
      case 'manager':
        return { backgroundColor: '#28a745', color: 'white' };
      default:
        return { backgroundColor: '#6c757d', color: 'white' };
    }
  };

  const handleTriggerReminders = async () => {
    try {
      const result = await adminService.triggerReminders();
      alert(`Reminders sent successfully!\n\nSMS Reminders: ${result.sms_reminders_sent}\nMaintenance Notifications: ${result.maintenance_notifications_sent}`);
    } catch (error) {
      alert('Failed to trigger reminders');
      console.error('Error triggering reminders:', error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1>Admin Dashboard</h1>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#d32f2f' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Admin Dashboard</h1>
        <button 
          onClick={handleTriggerReminders}
          className="btn"
          style={{ backgroundColor: '#ff9800', borderColor: '#ff9800' }}
        >
          Trigger Reminders Manually
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
          <h2 style={{ margin: 0 }}>User Management</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Total Users: {users.length}
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Cars</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Last Login</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Notifications</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span 
                      style={{
                        ...getRoleBadgeStyle(user.role),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{user.vehicle_count}</td>
                  <td style={{ padding: '12px' }}>{formatDate(user.last_login)}</td>
                  <td style={{ padding: '12px' }}>{user.phone_number || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    {user.email_notifications_enabled && <span style={{ marginRight: '8px' }}>📧</span>}
                    {user.sms_notifications_enabled && <span>📱</span>}
                    {!user.email_notifications_enabled && !user.sms_notifications_enabled && <span>-</span>}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      color: user.account_active ? '#28a745' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {user.account_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              No users found
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>Admin Quick Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <strong>Total Users:</strong> {users.length}
          </div>
          <div>
            <strong>Admin Users:</strong> {users.filter(u => u.role === 'admin').length}
          </div>
          <div>
            <strong>Total Vehicles:</strong> {users.reduce((sum, u) => sum + u.vehicle_count, 0)}
          </div>
          <div>
            <strong>Active Users:</strong> {users.filter(u => u.account_active).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;