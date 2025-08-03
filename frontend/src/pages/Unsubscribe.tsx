import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { userService, extractErrorMessage } from '../services/api';

const Unsubscribe: React.FC = () => {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmText.toLowerCase() !== 'unsubscribe') {
      setError('Please type "unsubscribe" to confirm');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await userService.unsubscribe();
      setIsUnsubscribed(true);
      
      // Logout after a brief delay to show success message
      setTimeout(() => {
        logout();
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isUnsubscribed) {
    return (
      <div className="container">
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            marginBottom: '30px'
          }}>
            <h2 style={{ margin: '0 0 10px 0' }}>Successfully Unsubscribed</h2>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>
              You have been unsubscribed from the CarLog service. You will no longer receive 
              SMS notifications or reminders.
            </p>
          </div>
          
          <p style={{ color: '#666', marginBottom: '20px' }}>
            You will be automatically logged out in a few seconds...
          </p>
          
          <Link to="/">
            <button className="btn">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>
            Unsubscribe from CarLog
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            We're sorry to see you go
          </p>
        </header>

        {user && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '30px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Account Information</h3>
            <p style={{ margin: '5px 0', color: '#666' }}>
              <strong>Email:</strong> {user.email}
            </p>
            {user.phone_number && (
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Phone:</strong> {user.phone_number}
              </p>
            )}
          </div>
        )}

        <div style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404',
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #ffeaa7',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>What happens when you unsubscribe:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Your account will be deactivated</li>
            <li>You will stop receiving all SMS notifications</li>
            <li>Your vehicle and maintenance data will be retained for 90 days</li>
            <li>You can reactivate your account by contacting support</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Alternative Options</h3>
          <p style={{ marginBottom: '15px' }}>
            If you only want to stop SMS notifications but keep your account active:
          </p>
          <Link to="/sms-opt-out">
            <button className="btn btn-secondary" style={{ marginRight: '10px' }}>
              SMS Opt-out Only
            </button>
          </Link>
          <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>
            You can also manage your notification preferences in your profile settings.
          </p>
        </div>

        {!user ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
              You need to be logged in to unsubscribe from your account.
            </p>
            <Link to="/login">
              <button className="btn">
                Login to Continue
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>
              Confirm Unsubscription
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                Type "unsubscribe" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type: unsubscribe"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              />
            </div>

            {error && (
              <div style={{ 
                color: '#721c24', 
                backgroundColor: '#f8d7da',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #f5c6cb',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link to="/dashboard">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ minWidth: '120px' }}
                >
                  Cancel
                </button>
              </Link>
              <button 
                type="submit" 
                className="btn btn-danger"
                disabled={isLoading || confirmText.toLowerCase() !== 'unsubscribe'}
                style={{ minWidth: '120px' }}
              >
                {isLoading ? 'Processing...' : 'Unsubscribe'}
              </button>
            </div>
          </form>
        )}

        <div style={{ 
          textAlign: 'center', 
          paddingTop: '20px', 
          borderTop: '1px solid #ddd',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@carlog.com" style={{ color: '#4CAF50' }}>
              support@carlog.com
            </a>
          </p>
          <Link to="/" style={{ color: '#4CAF50', textDecoration: 'none' }}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;