import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { userService } from '../services/api';

const Profile: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load existing user data if available
    if (user) {
      setEmail(user.email);
      setPhoneNumber(user.phone_number || '');
      setZipCode(user.zip_code || '');
      setEmailNotifications(user.email_notifications_enabled !== false);
      setSmsNotifications(user.sms_notifications_enabled === true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!zipCode.trim()) {
      setError('Zip code is required');
      setLoading(false);
      return;
    }

    // Password validation if changing
    if (password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    // Contact preference validation
    if (!emailNotifications && !smsNotifications) {
      setError('At least one contact method must be selected');
      setLoading(false);
      return;
    }

    // SMS validation
    if (smsNotifications && !phoneNumber.trim()) {
      setError('Phone number is required for SMS notifications');
      setLoading(false);
      return;
    }

    try {
      const updateData: any = {
        email,
        zip_code: zipCode,
        phone_number: phoneNumber || null,
        email_notifications_enabled: emailNotifications,
        sms_notifications_enabled: smsNotifications,
      };

      // Only include password if it's being changed
      if (password) {
        updateData.password = password;
      }

      await userService.updateMe(updateData);
      
      // Refresh user data in context
      await refreshUser();
      
      setSuccessMessage('Profile updated successfully!');
      
      // Navigate to vehicles after successful update
      setTimeout(() => {
        navigate('/vehicles');
      }, 500);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Your Profile</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Manage your account information and notification preferences
      </p>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Account Information</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              New Password (leave blank to keep current)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            />
          </div>

          {password && (
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="zipCode" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Zip Code *
            </label>
            <input
              id="zipCode"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
              required
            />
            <small style={{ color: '#666' }}>
              Used for weather-based maintenance recommendations
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="phoneNumber" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Phone Number {smsNotifications && '*'}
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            />
            <small style={{ color: '#666' }}>
              Required for SMS notifications
            </small>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Contact Preferences</h3>
          <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
            How would you like to receive notifications? (Select at least one)
          </p>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontWeight: 'normal' }}>Email Notifications</span>
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontWeight: 'normal' }}>SMS Notifications</span>
            </label>
          </div>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        {successMessage && <div style={{ color: 'green', marginBottom: '15px' }}>{successMessage}</div>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            className="btn" 
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/vehicles')}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;