import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vehicle } from '../types';
import { vehicleService } from '../services/api';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
    current_mileage: 0,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vehicleService.create(newVehicle);
      setShowAddForm(false);
      setNewVehicle({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        license_plate: '',
        current_mileage: 0,
      });
      loadVehicles();
    } catch (error) {
      console.error('Failed to add vehicle:', error);
    }
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Vehicles</h1>
        <div>
          <Link to="/dashboard">
            <button className="btn btn-secondary" style={{ marginRight: '10px' }}>
              Back to Dashboard
            </button>
          </Link>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn">
            Add Vehicle
          </button>
        </div>
      </header>

      {showAddForm && (
        <form onSubmit={handleAddVehicle} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Add New Vehicle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <input
              type="text"
              placeholder="Make"
              value={newVehicle.make}
              onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="text"
              placeholder="Model"
              value={newVehicle.model}
              onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Year"
              value={newVehicle.year}
              onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="text"
              placeholder="VIN (optional)"
              value={newVehicle.vin}
              onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="text"
              placeholder="License Plate (optional)"
              value={newVehicle.license_plate}
              onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Current Mileage"
              value={newVehicle.current_mileage}
              onChange={(e) => setNewVehicle({ ...newVehicle, current_mileage: parseInt(e.target.value) || 0 })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginTop: '15px' }}>
            <button type="submit" className="btn" style={{ marginRight: '10px' }}>
              Save Vehicle
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
            {vehicle.license_plate && <p>License: {vehicle.license_plate}</p>}
            {vehicle.current_mileage && <p>Mileage: {vehicle.current_mileage.toLocaleString()} miles</p>}
            <Link to={`/maintenance/${vehicle.id}`}>
              <button className="btn" style={{ marginTop: '10px' }}>
                View Maintenance
              </button>
            </Link>
          </div>
        ))}
        {vehicles.length === 0 && (
          <p>No vehicles yet. Add your first vehicle to get started!</p>
        )}
      </div>
    </div>
  );
};

export default Vehicles;