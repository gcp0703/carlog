import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { userService, extractErrorMessage } from '../services/api';

const SmsOptOut: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOptedOut, setIsOptedOut] = useState(false);
  const [isOptingIn, setIsOptingIn] = useState(false);
  const { user, updateUser } = useAuth();

  const handleOptOut = async () => {
    setIsLoading(true);
    setError('');

    try {
      await userService.smsOptOut();
      setIsOptedOut(true);
      // Update the user context to reflect SMS opt-out
      if (user) {
        updateUser({ ...user, sms_notifications_enabled: false });
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptIn = async () => {
    setIsOptingIn(true);
    setError('');

    try {
      await userService.smsOptIn();
      setIsOptedOut(false);
      // Update the user context to reflect SMS opt-in
      if (user) {
        updateUser({ ...user, sms_notifications_enabled: true });
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsOptingIn(false);
    }
  };

  const isCurrentlyOptedOut = user?.sms_notifications_enabled === false || isOptedOut;

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>
            SMS Notification Preferences
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Manage your SMS notification settings
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
            {user.phone_number ? (
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Phone:</strong> {user.phone_number}
              </p>
            ) : (
              <p style={{ margin: '5px 0', color: '#856404' }}>
                <strong>Phone:</strong> Not provided (required for SMS notifications)
              </p>
            )}
            <p style={{ margin: '5px 0', color: '#666' }}>
              <strong>SMS Notifications:</strong>{' '}
              <span style={{ 
                color: isCurrentlyOptedOut ? '#dc3545' : '#28a745',
                fontWeight: 'bold'
              }}>
                {isCurrentlyOptedOut ? 'Disabled' : 'Enabled'}
              </span>
            </p>
          </div>
        )}

        {isCurrentlyOptedOut ? (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404',
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>SMS Notifications Disabled</h3>
            <p style={{ marginBottom: '15px' }}>
              You have opted out of SMS notifications. You will not receive:
            </p>
            <ul style={{ margin: '0 0 15px 20px' }}>
              <li>Maintenance reminders</li>
              <li>Mileage update requests</li>
              <li>Service notifications</li>
            </ul>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              You can still access all CarLog features through the web interface.
            </p>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#d1ecf1', 
            color: '#0c5460',
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #bee5eb',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>SMS Notifications Enabled</h3>
            <p style={{ marginBottom: '15px' }}>
              You are currently receiving SMS notifications for:
            </p>
            <ul style={{ margin: '0 0 15px 20px' }}>
              <li>Maintenance reminders based on mileage and time</li>
              <li>Requests to update vehicle mileage</li>
              <li>Important service notifications</li>
            </ul>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Standard messaging rates may apply from your carrier.
            </p>
          </div>
        )}

        <div style={{
          backgroundColor: '#e2e3e5',
          color: '#383d41',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #d6d8db',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>About SMS Notifications</h3>
          <p style={{ marginBottom: '15px' }}>
            CarLog uses SMS to help you stay on top of your vehicle maintenance:
          </p>
          <ul style={{ margin: '0 0 15px 20px' }}>
            <li><strong>Maintenance Reminders:</strong> Get notified when service is due</li>
            <li><strong>Mileage Updates:</strong> Quick way to log your current mileage</li>
            <li><strong>Two-way Communication:</strong> Reply to messages to update records</li>
          </ul>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Messages are sent only when relevant to your maintenance schedule.
          </p>
        </div>

        {!user ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
              You need to be logged in to manage your SMS preferences.
            </p>
            <Link to="/login">
              <button className="btn">
                Login to Continue
              </button>
            </Link>
          </div>
        ) : !user.phone_number ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #f5c6cb',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Phone Number Required</h3>
              <p style={{ margin: 0 }}>
                You need to add a phone number to your profile to enable SMS notifications.
              </p>
            </div>
            <Link to="/profile">
              <button className="btn">
                Update Profile
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            {error && (
              <div style={{ 
                color: '#721c24', 
                backgroundColor: '#f8d7da',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #f5c6cb',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {isCurrentlyOptedOut ? (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Re-enable SMS Notifications</h3>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  Want to start receiving SMS reminders again? You can opt back in anytime.
                </p>
                <button 
                  onClick={handleOptIn}
                  disabled={isOptingIn}
                  className="btn"
                  style={{ minWidth: '160px', marginRight: '10px' }}
                >
                  {isOptingIn ? 'Enabling...' : 'Enable SMS Notifications'}
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Disable SMS Notifications</h3>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  You can opt out of SMS notifications while keeping your account active.
                  You'll still have full access to the web interface.
                </p>
                <button 
                  onClick={handleOptOut}
                  disabled={isLoading}
                  className="btn btn-danger"
                  style={{ minWidth: '160px', marginRight: '10px' }}
                >
                  {isLoading ? 'Processing...' : 'Disable SMS Notifications'}
                </button>
              </div>
            )}

            <Link to="/dashboard">
              <button className="btn btn-secondary" style={{ minWidth: '120px' }}>
                Back to Dashboard
              </button>
            </Link>
          </div>
        )}

        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Want to Leave CarLog Entirely?</h3>
          <p style={{ marginBottom: '15px' }}>
            If you want to deactivate your entire account and stop all notifications:
          </p>
          <Link to="/unsubscribe">
            <button className="btn btn-danger">
              Full Unsubscribe
            </button>
          </Link>
        </div>

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

export default SmsOptOut;