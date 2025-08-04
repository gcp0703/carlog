import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { adminService } from '../services/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [triggeringReminders, setTriggeringReminders] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleTriggerReminders = async () => {
    try {
      setTriggeringReminders(true);
      const result = await adminService.triggerReminders();
      alert(`Reminders sent successfully!\n\nSMS Reminders: ${result.sms_reminders_sent}\nMaintenance Notifications: ${result.maintenance_notifications_sent}`);
    } catch (error) {
      alert('Failed to trigger reminders');
      console.error('Error triggering reminders:', error);
    } finally {
      setTriggeringReminders(false);
    }
  };

  const adminSections = [
    {
      title: 'User Management',
      description: 'View and manage all users, their roles, and account status',
      icon: '👥',
      link: '/admin/users',
      color: '#2196F3'
    },
    {
      title: 'Prior Anthropic Calls',
      description: 'View AI recommendation logs and usage statistics',
      icon: '🤖',
      link: '/admin/ai-logs',
      color: '#9C27B0'
    }
  ];

  return (
    <div className="container">
      <h1 style={{ marginBottom: '10px' }}>Admin Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        Welcome to the CarLog administration panel
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        {adminSections.map((section) => (
          <Link 
            key={section.link}
            to={section.link} 
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '30px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            >
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '20px',
                filter: `drop-shadow(0 0 20px ${section.color}30)`
              }}>
                {section.icon}
              </div>
              <h2 style={{ 
                color: section.color, 
                marginBottom: '10px',
                fontSize: '24px'
              }}>
                {section.title}
              </h2>
              <p style={{ 
                color: '#666', 
                margin: 0,
                flex: 1
              }}>
                {section.description}
              </p>
              <div style={{
                marginTop: '20px',
                color: section.color,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                View {section.title} →
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '40px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            className="btn" 
            style={{ backgroundColor: '#ff9800', borderColor: '#ff9800' }}
            onClick={handleTriggerReminders}
            disabled={triggeringReminders}
          >
            {triggeringReminders ? 'Sending...' : 'Trigger Reminders'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;