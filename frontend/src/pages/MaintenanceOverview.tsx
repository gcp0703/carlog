import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Vehicle, MaintenanceRecord } from '../types';
import { vehicleService, maintenanceService } from '../services/api';

const MaintenanceOverview: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Form state for new record
  const [newRecord, setNewRecord] = useState({
    service_type: '',
    mileage: 0,
    service_date: new Date().toISOString().split('T')[0],
    description: '',
    cost: 0,
    service_provider: '',
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const vehicleData = await vehicleService.getAll();
        setVehicles(vehicleData);
        
        // Set initial selection from URL params or first vehicle
        const vehicleFromUrl = searchParams.get('vehicle');
        if (vehicleFromUrl && vehicleData.some(v => v.id === vehicleFromUrl)) {
          setSelectedVehicleId(vehicleFromUrl);
        } else if (vehicleData.length > 0) {
          setSelectedVehicleId(vehicleData[0].id);
        }
      } catch (error) {
        setError('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [searchParams]);

  // Fetch maintenance records when selected vehicle changes
  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      if (!selectedVehicleId) return;
      
      try {
        setRecordsLoading(true);
        const records = await maintenanceService.getRecords(selectedVehicleId);
        setMaintenanceRecords(records.sort((a, b) => 
          new Date(b.service_date).getTime() - new Date(a.service_date).getTime()
        ));
      } catch (error) {
        // Error loading records, set empty array
        setMaintenanceRecords([]);
      } finally {
        setRecordsLoading(false);
      }
    };

    fetchMaintenanceRecords();
  }, [selectedVehicleId]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Update mileage when vehicle changes
  useEffect(() => {
    if (selectedVehicle?.current_mileage) {
      setNewRecord(prev => ({ ...prev, mileage: selectedVehicle.current_mileage || 0 }));
    }
  }, [selectedVehicle]);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return;

    setIsSubmitting(true);
    try {
      const recordToCreate = {
        vehicle_id: selectedVehicleId,
        service_type: newRecord.service_type,
        mileage: newRecord.mileage,
        service_date: newRecord.service_date,
        description: newRecord.description || undefined,
        cost: newRecord.cost || undefined,
        service_provider: newRecord.service_provider || undefined,
      };

      const createdRecord = await maintenanceService.createRecord(recordToCreate);
      
      // Add the new record to the list and resort
      const updatedRecords = [...maintenanceRecords, createdRecord].sort((a, b) => 
        new Date(b.service_date).getTime() - new Date(a.service_date).getTime()
      );
      setMaintenanceRecords(updatedRecords);
      
      // Reset form and close dialog
      setNewRecord({
        service_type: '',
        mileage: selectedVehicle?.current_mileage || 0,
        service_date: new Date().toISOString().split('T')[0],
        description: '',
        cost: 0,
        service_provider: '',
      });
      setShowAddDialog(false);
    } catch (error) {
      alert('Failed to add maintenance record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h1>Maintenance Records</h1>
        <p>Loading vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Maintenance Records</h1>
        <p style={{ color: '#d32f2f' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Maintenance Records</h1>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Manage maintenance records for all your vehicles</p>
      </header>

      {/* Add Record Dialog */}
      {showAddDialog && selectedVehicle && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowAddDialog(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1001,
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Add Maintenance Record</h3>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              {selectedVehicle.year} {selectedVehicle.brand} {selectedVehicle.model}
              {selectedVehicle.trim && ` ${selectedVehicle.trim}`}
            </p>
            
            <form onSubmit={handleAddRecord}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Service Type *
                </label>
                <select
                  value={newRecord.service_type}
                  onChange={(e) => setNewRecord({ ...newRecord, service_type: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="">Select service type</option>
                  <option value="oil_change">Oil Change</option>
                  <option value="tire_rotation">Tire Rotation</option>
                  <option value="brake_service">Brake Service</option>
                  <option value="air_filter">Air Filter</option>
                  <option value="cabin_filter">Cabin Filter</option>
                  <option value="transmission">Transmission Service</option>
                  <option value="coolant">Coolant Service</option>
                  <option value="battery">Battery Service</option>
                  <option value="spark_plugs">Spark Plugs</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Mileage *
                </label>
                <input
                  type="number"
                  value={newRecord.mileage}
                  onChange={(e) => setNewRecord({ ...newRecord, mileage: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Service Date *
                </label>
                <input
                  type="date"
                  value={newRecord.service_date}
                  onChange={(e) => setNewRecord({ ...newRecord, service_date: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Cost ($)
                </label>
                <input
                  type="number"
                  value={newRecord.cost || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, cost: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Service Provider
                </label>
                <input
                  type="text"
                  value={newRecord.service_provider}
                  onChange={(e) => setNewRecord({ ...newRecord, service_provider: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Notes
                </label>
                <textarea
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowAddDialog(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {vehicles.length === 0 ? (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '8px', 
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h2>No Vehicles Found</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Add a vehicle to start tracking maintenance records.
          </p>
          <Link to="/vehicles">
            <button className="btn">
              Add Vehicle
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Select Vehicle:
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.brand} {vehicle.model}
                  {vehicle.trim && ` ${vehicle.trim}`}
                </option>
              ))}
            </select>
          </div>

          {selectedVehicle && (
            <div style={{ 
              border: '1px solid #ddd', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '30px',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
                {selectedVehicle.year} {selectedVehicle.brand} {selectedVehicle.model}
                {selectedVehicle.trim && ` ${selectedVehicle.trim}`}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {selectedVehicle.current_mileage && (
                  <div>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>Current Mileage</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
                      {selectedVehicle.current_mileage.toLocaleString()} miles
                    </p>
                  </div>
                )}
                <div>
                  <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>Total Records</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
                    {maintenanceRecords.length}
                  </p>
                </div>
                {maintenanceRecords.length > 0 && (
                  <div>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>Last Service</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
                      {new Date(maintenanceRecords[0].service_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedVehicle && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <button 
                  onClick={() => setShowAddDialog(true)}
                  style={{
                    background: '#4CAF50',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '20px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#45a049'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#4CAF50'}
                  title="Add maintenance record"
                >
                  +
                </button>
                <h2 style={{ margin: 0 }}>Maintenance History</h2>
              </div>
              {recordsLoading ? (
                <p>Loading maintenance records...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Mileage</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Service Type</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceRecords.map((record, index) => (
                        <tr 
                          key={record.id} 
                          style={{ 
                            borderBottom: index < maintenanceRecords.length - 1 ? '1px solid #dee2e6' : 'none'
                          }}
                        >
                          <td style={{ padding: '12px' }}>
                            {new Date(record.service_date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {record.mileage.toLocaleString()} miles
                          </td>
                          <td style={{ padding: '12px' }}>
                            {record.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td style={{ padding: '12px', color: '#666' }}>
                            {record.description || record.service_provider || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {maintenanceRecords.length === 0 && (
                    <div style={{ 
                      padding: '40px', 
                      textAlign: 'center',
                      color: '#666'
                    }}>
                      <p>No maintenance records found for this vehicle.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MaintenanceOverview;