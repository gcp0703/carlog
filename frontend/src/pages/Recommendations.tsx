import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Vehicle } from '../types';
import { vehicleService } from '../services/api';
import RecommendationsTable from '../components/RecommendationsTable';

const Recommendations: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedVehicleId) return;
      
      try {
        setLoadingRecommendations(true);
        setRecommendations(null);
        const result = await vehicleService.getRecommendations(selectedVehicleId);
        setRecommendations(result.recommendations);
        setIsCached(result.cached);
        setGeneratedAt(result.generated_at);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setRecommendations(null);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [selectedVehicleId]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  if (loading) {
    return (
      <div className="container">
        <h1>Service Recommendations</h1>
        <p>Loading vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Service Recommendations</h1>
        <p style={{ color: '#d32f2f' }}>{error}</p>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="container">
        <h1>Service Recommendations</h1>
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '8px', 
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h2>No Vehicles Found</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Add a vehicle to start receiving AI-powered maintenance recommendations.
          </p>
          <Link to="/vehicles">
            <button className="btn">
              Add Vehicle
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ margin: '0' }}>Service Recommendations</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>AI-powered maintenance recommendations</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              Vehicle:
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              style={{
                width: '300px',
                padding: '8px',
                fontSize: '15px',
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
              display: 'flex', 
              gap: '30px',
              alignItems: 'center',
              padding: '15px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e0e0e0'
            }}>
            {selectedVehicle.current_mileage && (
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Mileage</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {selectedVehicle.current_mileage.toLocaleString()}
                </div>
              </div>
            )}
            {selectedVehicle.usage_pattern && (
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Usage</div>
                <div style={{ fontSize: '16px', color: '#333' }}>
                  {selectedVehicle.usage_pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/maintenance?vehicle=${selectedVehicle.id}`}>
                <button className="btn btn-secondary btn-sm">View Records</button>
              </Link>
            </div>
          </div>
          )}
        </div>
      </div>
      
      <div style={{
        backgroundColor: '#e3f2fd',
        border: '1px solid #1976d2',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>
          What Our AI Analyzes
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <strong style={{ color: '#1565c0' }}>Immediate Needs:</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
              <li>Urgent maintenance items</li>
              <li>Safety-critical services</li>
              <li>Overdue maintenance</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#1565c0' }}>Scheduled Services:</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
              <li>Upcoming maintenance by mileage</li>
              <li>Time-based service intervals</li>
              <li>Manufacturer recommendations</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#1565c0' }}>Model-Specific Insights:</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
              <li>Known issues for your model</li>
              <li>Preventive measures</li>
              <li>Recall information</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#1565c0' }}>Cost Estimates:</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
              <li>Service cost ranges</li>
              <li>Priority-based budgeting</li>
              <li>Location-specific pricing</li>
            </ul>
          </div>
        </div>
      </div>

      {loadingRecommendations ? (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '40px', 
          borderRadius: '8px', 
          textAlign: 'center'
        }}>
          <h2>Loading Recommendations...</h2>
          <p style={{ color: '#666' }}>Analyzing your vehicle's maintenance history...</p>
        </div>
      ) : recommendations ? (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '15px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #ddd'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Maintenance Recommendations</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {isCached && (
                <span style={{ 
                  fontSize: '13px', 
                  color: '#666',
                  backgroundColor: '#e8f5e9',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid #c8e6c9'
                }}>
                  Cached Result
                </span>
              )}
              {generatedAt && (
                <span style={{ fontSize: '13px', color: '#666' }}>
                  Generated: {new Date(generatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <RecommendationsTable recommendations={recommendations} />
        </div>
      ) : (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center'
        }}>
          <h2>Recommendations Coming Soon</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Our AI system will analyze your vehicle data and provide personalized maintenance recommendations based on:
          </p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto 20px auto' }}>
            <li>Current mileage and service history</li>
            <li>Vehicle age and usage patterns</li>
            <li>Manufacturer recommendations</li>
            <li>Weather and driving conditions in your area</li>
          </ul>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/vehicles">
              <button className="btn">
                Manage Vehicles
              </button>
            </Link>
            {selectedVehicle && (
              <Link to={`/maintenance?vehicle=${selectedVehicle.id}`}>
                <button className="btn btn-secondary">
                  View Maintenance Records
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;