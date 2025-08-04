import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { vehicleService } from '../services/api';
import { Vehicle } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setVehiclesLoading(true);
        setVehiclesError(null);
        const vehicleData = await vehicleService.getAll();
        setVehicles(vehicleData);
      } catch (error) {
        setVehiclesError('Failed to load vehicles');
        // Error is already displayed to user via setVehiclesError
      } finally {
        setVehiclesLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', minHeight: '250px' }}>
          <div style={{ flex: 1 }}>
            <h2>Your Profile</h2>
            <p>Update your preferences and settings</p>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              {user?.zip_code && <div>Zip Code: {user.zip_code}</div>}
              {user?.phone_number && <div>Phone: {user.phone_number}</div>}
              <div>
                Notifications: {' '}
                <span style={{ 
                  fontWeight: 'bold'
                }}>
                  {(() => {
                    const notifications = [];
                    if (user?.email_notifications_enabled !== false) {
                      notifications.push('Email');
                    }
                    if (user?.phone_number && user.sms_notifications_enabled) {
                      notifications.push('SMS');
                    }
                    return notifications.length > 0 ? notifications.join(', ') : 'None';
                  })()}
                </span>
              </div>
            </div>
          </div>
          <div>
            <Link to="/profile">
              <button className="btn">Update Profile</button>
            </Link>
            {user?.phone_number && (
              <Link to="/sms-opt-out" style={{ marginLeft: '10px' }}>
                <button className="btn btn-secondary" style={{ fontSize: '14px', padding: '8px 12px' }}>
                  SMS Settings
                </button>
              </Link>
            )}
          </div>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', minHeight: '250px' }}>
          <div style={{ flex: 1 }}>
            <h2>Your Vehicles</h2>
            {vehiclesLoading ? (
              <p>Loading vehicles...</p>
            ) : vehiclesError ? (
              <p style={{ color: '#d32f2f' }}>{vehiclesError}</p>
            ) : vehicles.length === 0 ? (
              <p>No vehicles registered yet</p>
            ) : (
              <div>
                {vehicles.slice(0, 3).map((vehicle, index) => (
                  <div 
                    key={vehicle.id} 
                    style={{ 
                      marginBottom: index < Math.min(vehicles.length, 3) - 1 ? '10px' : '0',
                      fontSize: '14px',
                      padding: '8px 0',
                      borderBottom: index < Math.min(vehicles.length, 3) - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      {vehicle.year} {vehicle.brand} {vehicle.model}
                    </div>
                    {vehicle.trim && (
                      <div style={{ color: '#666', fontSize: '13px' }}>
                        {vehicle.trim}
                      </div>
                    )}
                  </div>
                ))}
                {vehicles.length > 3 && (
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                    +{vehicles.length - 3} more vehicle{vehicles.length - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <Link to="/vehicles">
              <button className="btn">
                {vehicles.length === 0 ? 'Add Vehicle' : 'View Vehicles'}
              </button>
            </Link>
          </div>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', minHeight: '250px' }}>
          <div style={{ flex: 1 }}>
            <h2>Maintenance Records</h2>
            <p>Manage service history</p>
          </div>
          <div>
            <Link to="/vehicles">
              <button className="btn">View Records</button>
            </Link>
          </div>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', minHeight: '250px' }}>
          <div style={{ flex: 1 }}>
            <h2>Service Recommendations</h2>
            <p>Courtesy of CarLog AI</p>
          </div>
          <div>
            <Link to="/vehicles">
              <button className="btn">View Schedule</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;