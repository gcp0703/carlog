import React from 'react';
import { Link } from 'react-router-dom';

const Admin: React.FC = () => {
  return (
    <div className="container">
      <h1>Admin Functions</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>Administrative tools and system monitoring</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        <Link to="/admin/ai-logs" style={{ textDecoration: 'none' }}>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fff',
            transition: 'box-shadow 0.2s, transform 0.2s',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>View AI Logs</h3>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 15px 0', flex: 1 }}>
              View all requests and responses from the Claude AI API, including prompts, recommendations, and timestamps.
            </p>
            <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '14px' }}>
              View Logs →
            </div>
          </div>
        </Link>

        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          opacity: 0.7,
          cursor: 'not-allowed'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#999' }}>User Management</h3>
          <p style={{ color: '#999', fontSize: '14px', margin: '0 0 15px 0' }}>
            Manage user accounts, permissions, and access levels.
          </p>
          <div style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
            Coming Soon
          </div>
        </div>

        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          opacity: 0.7,
          cursor: 'not-allowed'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#999' }}>System Statistics</h3>
          <p style={{ color: '#999', fontSize: '14px', margin: '0 0 15px 0' }}>
            View system usage statistics, API calls, and performance metrics.
          </p>
          <div style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
            Coming Soon
          </div>
        </div>

        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          opacity: 0.7,
          cursor: 'not-allowed'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#999' }}>Database Management</h3>
          <p style={{ color: '#999', fontSize: '14px', margin: '0 0 15px 0' }}>
            Backup, restore, and manage Neo4j database operations.
          </p>
          <div style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;