import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MaintenanceRecord, Vehicle } from '../types';
import { maintenanceService, vehicleService } from '../services/api';

const Maintenance: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    service_type: '',
    mileage: 0,
    service_date: new Date().toISOString().split('T')[0],
    description: '',
    cost: 0,
    service_provider: '',
  });

  useEffect(() => {
    if (vehicleId) {
      loadVehicle();
      loadRecords();
    }
  }, [vehicleId]);

  const loadVehicle = async () => {
    if (!vehicleId) return;
    try {
      const data = await vehicleService.getById(vehicleId);
      setVehicle(data);
    } catch (error) {
      console.error('Failed to load vehicle:', error);
    }
  };

  const loadRecords = async () => {
    if (!vehicleId) return;
    try {
      const data = await maintenanceService.getRecords(vehicleId);
      setRecords(data);
    } catch (error) {
      console.error('Failed to load maintenance records:', error);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;
    
    try {
      await maintenanceService.createRecord({
        ...newRecord,
        vehicle_id: vehicleId,
      });
      setShowAddForm(false);
      setNewRecord({
        service_type: '',
        mileage: 0,
        service_date: new Date().toISOString().split('T')[0],
        description: '',
        cost: 0,
        service_provider: '',
      });
      loadRecords();
    } catch (error) {
      console.error('Failed to add maintenance record:', error);
    }
  };

  if (!vehicle) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Maintenance Records - {vehicle.year} {vehicle.make} {vehicle.model}</h1>
        <div>
          <Link to="/vehicles">
            <button className="btn btn-secondary" style={{ marginRight: '10px' }}>
              Back to Vehicles
            </button>
          </Link>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn">
            Add Record
          </button>
        </div>
      </header>

      {showAddForm && (
        <form onSubmit={handleAddRecord} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Add Maintenance Record</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <input
              type="text"
              placeholder="Service Type (e.g., Oil Change)"
              value={newRecord.service_type}
              onChange={(e) => setNewRecord({ ...newRecord, service_type: e.target.value })}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Mileage"
              value={newRecord.mileage}
              onChange={(e) => setNewRecord({ ...newRecord, mileage: parseInt(e.target.value) || 0 })}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="date"
              value={newRecord.service_date}
              onChange={(e) => setNewRecord({ ...newRecord, service_date: e.target.value })}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cost (optional)"
              value={newRecord.cost}
              onChange={(e) => setNewRecord({ ...newRecord, cost: parseFloat(e.target.value) || 0 })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="text"
              placeholder="Service Provider (optional)"
              value={newRecord.service_provider}
              onChange={(e) => setNewRecord({ ...newRecord, service_provider: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <textarea
              placeholder="Description (optional)"
              value={newRecord.description}
              onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', gridColumn: '1 / -1' }}
              rows={3}
            />
          </div>
          <div style={{ marginTop: '15px' }}>
            <button type="submit" className="btn" style={{ marginRight: '10px' }}>
              Save Record
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {records.map((record) => (
          <div key={record.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3>{record.service_type}</h3>
                <p>Date: {new Date(record.service_date).toLocaleDateString()}</p>
                <p>Mileage: {record.mileage.toLocaleString()} miles</p>
                {record.service_provider && <p>Provider: {record.service_provider}</p>}
                {record.cost && <p>Cost: ${record.cost.toFixed(2)}</p>}
                {record.description && <p>Description: {record.description}</p>}
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <p>No maintenance records yet. Add your first record to start tracking!</p>
        )}
      </div>
    </div>
  );
};

export default Maintenance;