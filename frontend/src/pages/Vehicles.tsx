import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vehicle } from '../types';
import { vehicleService, carApiService } from '../services/api';
import { useAuth } from '../components/auth/AuthContext';

// State/Province data for different countries
const statesByCountry: Record<string, Array<{ code: string; name: string }>> = {
  USA: [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' }
  ],
  Canada: [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukon' }
  ],
  Mexico: [
    { code: 'AGU', name: 'Aguascalientes' },
    { code: 'BCN', name: 'Baja California' },
    { code: 'BCS', name: 'Baja California Sur' },
    { code: 'CAM', name: 'Campeche' },
    { code: 'CHP', name: 'Chiapas' },
    { code: 'CHH', name: 'Chihuahua' },
    { code: 'CMX', name: 'Ciudad de México' },
    { code: 'COA', name: 'Coahuila' },
    { code: 'COL', name: 'Colima' },
    { code: 'DUR', name: 'Durango' },
    { code: 'GUA', name: 'Guanajuato' },
    { code: 'GRO', name: 'Guerrero' },
    { code: 'HID', name: 'Hidalgo' },
    { code: 'JAL', name: 'Jalisco' },
    { code: 'MEX', name: 'México' },
    { code: 'MIC', name: 'Michoacán' },
    { code: 'MOR', name: 'Morelos' },
    { code: 'NAY', name: 'Nayarit' },
    { code: 'NLE', name: 'Nuevo León' },
    { code: 'OAX', name: 'Oaxaca' },
    { code: 'PUE', name: 'Puebla' },
    { code: 'QUE', name: 'Querétaro' },
    { code: 'ROO', name: 'Quintana Roo' },
    { code: 'SLP', name: 'San Luis Potosí' },
    { code: 'SIN', name: 'Sinaloa' },
    { code: 'SON', name: 'Sonora' },
    { code: 'TAB', name: 'Tabasco' },
    { code: 'TAM', name: 'Tamaulipas' },
    { code: 'TLA', name: 'Tlaxcala' },
    { code: 'VER', name: 'Veracruz' },
    { code: 'YUC', name: 'Yucatán' },
    { code: 'ZAC', name: 'Zacatecas' }
  ],
  Other: []
};

const Vehicles: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    brand_id: undefined as number | undefined,
    model: '',
    model_id: undefined as number | undefined,
    year: 0,
    trim: '',
    trim_id: undefined as number | undefined,
    zip_code: '',
    usage_pattern: '',
    usage_notes: '',
    vin: '',
    license_plate: '',
    license_country: 'USA',
    license_state: '',
    current_mileage: 0,
  });

  const [editingVehicle, setEditingVehicle] = useState({
    brand: '',
    brand_id: undefined as number | undefined,
    model: '',
    model_id: undefined as number | undefined,
    year: 0,
    trim: '',
    trim_id: undefined as number | undefined,
    zip_code: '',
    usage_pattern: '',
    usage_notes: '',
    vin: '',
    license_plate: '',
    license_country: 'USA',
    license_state: '',
    current_mileage: 0,
  });

  // CarAPI data states
  const [years, setYears] = useState<Array<{ year: number }>>([]);
  const [makes, setMakes] = useState<Array<{ make: string; make_id: number }>>([]);
  const [models, setModels] = useState<Array<{ model: string; model_id: number }>>([]);
  const [trims, setTrims] = useState<Array<{ trim: string; trim_id: number }>>([]);

  // Loading states for dropdowns
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingTrims, setLoadingTrims] = useState(false);

  // Load years on component mount and when add form is shown
  useEffect(() => {
    if (showAddForm && years.length === 0) {
      loadYears();
    }
  }, [showAddForm, years.length]);

  const loadYears = async () => {
    try {
      setLoadingYears(true);
      setError(null);
      const response = await carApiService.getYears();
      setYears(response.data);
    } catch (error) {
      setError('Failed to load years. Please try again.');
    } finally {
      setLoadingYears(false);
    }
  };

  const loadMakes = async (year: number) => {
    try {
      setLoadingMakes(true);
      setError(null);
      const response = await carApiService.getMakes(year);
      setMakes(response.data);
    } catch (error) {
      setError('Failed to load makes. Please try again.');
    } finally {
      setLoadingMakes(false);
    }
  };

  const loadModels = async (year: number, make: string) => {
    try {
      setLoadingModels(true);
      setError(null);
      const response = await carApiService.getModels(year, make);
      setModels(response.data);
    } catch (error) {
      setError('Failed to load models. Please try again.');
    } finally {
      setLoadingModels(false);
    }
  };

  const loadTrims = async (year: number, make: string, model: string) => {
    try {
      setLoadingTrims(true);
      setError(null);
      const response = await carApiService.getTrims(year, make, model);
      setTrims(response.data);
    } catch (error) {
      setError('Failed to load trims. Please try again.');
    } finally {
      setLoadingTrims(false);
    }
  };

  // Handle cascading dropdown changes
  const handleYearChange = (year: number) => {
    setNewVehicle({
      ...newVehicle,
      year,
      brand: '',
      brand_id: undefined,
      model: '',
      model_id: undefined,
      trim: '',
      trim_id: undefined
    });
    setMakes([]);
    setModels([]);
    setTrims([]);
    
    if (year > 0) {
      loadMakes(year);
    }
  };

  const handleMakeChange = (makeValue: string) => {
    const selectedMake = makes.find(m => m.make === makeValue);
    setNewVehicle({
      ...newVehicle,
      brand: makeValue,
      brand_id: selectedMake?.make_id || undefined,
      model: '',
      model_id: undefined,
      trim: '',
      trim_id: undefined
    });
    setModels([]);
    setTrims([]);
    
    if (makeValue && newVehicle.year > 0) {
      loadModels(newVehicle.year, makeValue);
    }
  };

  const handleModelChange = (modelValue: string) => {
    const selectedModel = models.find(m => m.model === modelValue);
    setNewVehicle({
      ...newVehicle,
      model: modelValue,
      model_id: selectedModel?.model_id || undefined,
      trim: '',
      trim_id: undefined
    });
    setTrims([]);
    
    if (modelValue && newVehicle.year > 0 && newVehicle.brand) {
      loadTrims(newVehicle.year, newVehicle.brand, modelValue);
    }
  };

  const handleTrimChange = (trimValue: string) => {
    const selectedTrim = trims.find(t => t.trim === trimValue);
    setNewVehicle({
      ...newVehicle,
      trim: trimValue,
      trim_id: selectedTrim?.trim_id || undefined
    });
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setError(null);
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      setError('Failed to load vehicles. Please try again.');
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      await vehicleService.create(newVehicle);
      setShowAddForm(false);
      setNewVehicle({
        brand: '',
        brand_id: undefined,
        model: '',
        model_id: undefined,
        year: 0,
        trim: '',
        trim_id: undefined,
        zip_code: '',
        usage_pattern: '',
        usage_notes: '',
        vin: '',
        license_plate: '',
        license_country: 'USA',
        license_state: '',
        current_mileage: 0,
      });
      // Reset dropdown states
      setMakes([]);
      setModels([]);
      setTrims([]);
      loadVehicles();
    } catch (error) {
      setError('Failed to add vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setEditingVehicle({
      brand: vehicle.brand,
      brand_id: vehicle.brand_id,
      model: vehicle.model,
      model_id: vehicle.model_id,
      year: vehicle.year,
      trim: vehicle.trim || '',
      trim_id: vehicle.trim_id,
      zip_code: vehicle.zip_code || '',
      usage_pattern: vehicle.usage_pattern || '',
      usage_notes: vehicle.usage_notes || '',
      vin: vehicle.vin || '',
      license_plate: vehicle.license_plate || '',
      license_country: vehicle.license_country || 'USA',
      license_state: vehicle.license_state || '',
      current_mileage: vehicle.current_mileage || 0,
    });
  };

  const handleUpdateVehicle = async (vehicleId: string) => {
    try {
      setError(null);
      setLoading(true);
      await vehicleService.update(vehicleId, editingVehicle);
      setEditingVehicleId(null);
      loadVehicles();
    } catch (error) {
      setError('Failed to update vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingVehicleId(null);
    setEditingVehicle({
      brand: '',
      brand_id: undefined,
      model: '',
      model_id: undefined,
      year: 0,
      trim: '',
      trim_id: undefined,
      zip_code: '',
      usage_pattern: '',
      usage_notes: '',
      vin: '',
      license_plate: '',
      license_country: 'USA',
      license_state: '',
      current_mileage: 0,
    });
  };

  return (
    <div className="container">
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          marginBottom: '20px', 
          borderRadius: '4px', 
          border: '1px solid #f5c6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#721c24', 
              cursor: 'pointer', 
              fontSize: '18px',
              padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>
      )}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Vehicles</h1>
        <div>
          <Link to="/dashboard">
            <button className="btn btn-secondary" style={{ marginRight: '10px' }}>
              Back to Dashboard
            </button>
          </Link>
          <button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm && user?.zip_code) {
                setNewVehicle(prev => ({ ...prev, zip_code: user.zip_code || '' }));
              }
            }} 
            className="btn"
          >
            Add Vehicle
          </button>
        </div>
      </header>

      {showAddForm && (
        <form onSubmit={handleAddVehicle} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Add New Vehicle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Year - First in the cascade */}
            <div>
              <label htmlFor="year" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Year *
              </label>
              <select
                id="year"
                value={newVehicle.year || ''}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                required
                disabled={loadingYears}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">{loadingYears ? 'Loading years...' : 'Select a year'}</option>
                {years.map(yearObj => (
                  <option key={yearObj.year} value={yearObj.year}>{yearObj.year}</option>
                ))}
              </select>
            </div>

            {/* Make - Second in the cascade */}
            <div>
              <label htmlFor="brand" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Make *
              </label>
              <select
                id="brand"
                value={newVehicle.brand}
                onChange={(e) => handleMakeChange(e.target.value)}
                required
                disabled={!newVehicle.year || loadingMakes}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">
                  {!newVehicle.year 
                    ? 'Select year first' 
                    : loadingMakes 
                    ? 'Loading makes...' 
                    : 'Select a make'
                  }
                </option>
                {makes.map(makeObj => (
                  <option key={makeObj.make} value={makeObj.make}>{makeObj.make}</option>
                ))}
              </select>
            </div>

            {/* Model - Third in the cascade */}
            <div>
              <label htmlFor="model" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Model *
              </label>
              <select
                id="model"
                value={newVehicle.model}
                onChange={(e) => handleModelChange(e.target.value)}
                required
                disabled={!newVehicle.brand || loadingModels}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">
                  {!newVehicle.brand 
                    ? 'Select make first' 
                    : loadingModels 
                    ? 'Loading models...' 
                    : 'Select a model'
                  }
                </option>
                {models.map(modelObj => (
                  <option key={modelObj.model} value={modelObj.model}>{modelObj.model}</option>
                ))}
              </select>
            </div>

            {/* Trim - Fourth in the cascade */}
            <div>
              <label htmlFor="trim" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Trim
              </label>
              <select
                id="trim"
                value={newVehicle.trim}
                onChange={(e) => handleTrimChange(e.target.value)}
                disabled={!newVehicle.model || loadingTrims}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">
                  {!newVehicle.model 
                    ? 'Select model first' 
                    : loadingTrims 
                    ? 'Loading trims...' 
                    : 'Select a trim (optional)'
                  }
                </option>
                {trims.map(trimObj => (
                  <option key={trimObj.trim} value={trimObj.trim}>{trimObj.trim}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="current_mileage" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Current Mileage *
              </label>
              <input
                id="current_mileage"
                type="number"
                placeholder="e.g., 25000"
                value={newVehicle.current_mileage}
                onChange={(e) => setNewVehicle({ ...newVehicle, current_mileage: parseInt(e.target.value) || 0 })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            
            <div>
              <label htmlFor="zip_code" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Zip Code
              </label>
              <input
                id="zip_code"
                type="text"
                placeholder="Enables AI to make regional recommendations"
                value={newVehicle.zip_code}
                onChange={(e) => setNewVehicle({ ...newVehicle, zip_code: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            
            <div>
              <label htmlFor="vin" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                VIN (optional)
              </label>
              <input
                id="vin"
                type="text"
                placeholder="Vehicle Identification Number"
                value={newVehicle.vin}
                onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                License Plate (optional)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 1fr', gap: '10px' }}>
                <div>
                  <label htmlFor="license_country" style={{ display: 'block', marginBottom: '3px', fontSize: '12px', color: '#666' }}>
                    Country
                  </label>
                  <select
                    id="license_country"
                    value={newVehicle.license_country}
                    onChange={(e) => setNewVehicle({ ...newVehicle, license_country: e.target.value, license_state: '' })}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="USA">USA</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="license_state" style={{ display: 'block', marginBottom: '3px', fontSize: '12px', color: '#666' }}>
                    {newVehicle.license_country === 'USA' ? 'State' : 
                     newVehicle.license_country === 'Canada' ? 'Province' :
                     newVehicle.license_country === 'Mexico' ? 'State' : 'State/Province'}
                  </label>
                  {newVehicle.license_country === 'Other' ? (
                    <input
                      id="license_state"
                      type="text"
                      placeholder="e.g., NSW"
                      value={newVehicle.license_state}
                      onChange={(e) => setNewVehicle({ ...newVehicle, license_state: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  ) : (
                    <select
                      id="license_state"
                      value={newVehicle.license_state}
                      onChange={(e) => setNewVehicle({ ...newVehicle, license_state: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="">Select {newVehicle.license_country === 'Canada' ? 'province' : 'state'}</option>
                      {statesByCountry[newVehicle.license_country]?.map(state => (
                        <option key={state.code} value={state.code}>
                          {state.code} - {state.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label htmlFor="license_plate" style={{ display: 'block', marginBottom: '3px', fontSize: '12px', color: '#666' }}>
                    Plate Number
                  </label>
                  <input
                    id="license_plate"
                    type="text"
                    placeholder="e.g., ABC 1234"
                    value={newVehicle.license_plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="usage_pattern" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Usage
              </label>
              <select
                id="usage_pattern"
                value={newVehicle.usage_pattern}
                onChange={(e) => setNewVehicle({ ...newVehicle, usage_pattern: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Select usage pattern</option>
                <option value="daily_commuter">Daily Commuter</option>
                <option value="weekend_driver">Weekend Driver</option>
                <option value="mixed">Mixed Usage</option>
              </select>
              <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                Affects maintenance scheduling recommendations
              </small>
            </div>
            
            <div>
              <label htmlFor="usage_notes" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Notes (do not enter maintenance information)
              </label>
              <textarea
                id="usage_notes"
                placeholder="Example: minor accident damaged right wheel"
                value={newVehicle.usage_notes}
                onChange={(e) => setNewVehicle({ ...newVehicle, usage_notes: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '40px', resize: 'vertical' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <button type="submit" className="btn" style={{ marginRight: '10px' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Vehicle'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            {editingVehicleId === vehicle.id ? (
              // Edit mode
              <div>
                <h3>Edit Vehicle</h3>
                <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Current Mileage
                    </label>
                    <input
                      type="number"
                      value={editingVehicle.current_mileage}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, current_mileage: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Zip Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enables AI to make regional recommendations"
                      value={editingVehicle.zip_code}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, zip_code: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      VIN (optional)
                    </label>
                    <input
                      type="text"
                      value={editingVehicle.vin}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, vin: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      License Plate (optional)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px', color: '#666' }}>
                          Country
                        </label>
                        <select
                          value={editingVehicle.license_country}
                          onChange={(e) => setEditingVehicle({ ...editingVehicle, license_country: e.target.value, license_state: '' })}
                          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          <option value="USA">USA</option>
                          <option value="Canada">Canada</option>
                          <option value="Mexico">Mexico</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px', color: '#666' }}>
                          {editingVehicle.license_country === 'USA' ? 'State' : 
                           editingVehicle.license_country === 'Canada' ? 'Province' :
                           editingVehicle.license_country === 'Mexico' ? 'State' : 'State/Province'}
                        </label>
                        {editingVehicle.license_country === 'Other' ? (
                          <input
                            type="text"
                            value={editingVehicle.license_state}
                            onChange={(e) => setEditingVehicle({ ...editingVehicle, license_state: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                          />
                        ) : (
                          <select
                            value={editingVehicle.license_state}
                            onChange={(e) => setEditingVehicle({ ...editingVehicle, license_state: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                          >
                            <option value="">Select</option>
                            {statesByCountry[editingVehicle.license_country]?.map(state => (
                              <option key={state.code} value={state.code}>
                                {state.code}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px', color: '#666' }}>
                          Plate Number
                        </label>
                        <input
                          type="text"
                          value={editingVehicle.license_plate}
                          onChange={(e) => setEditingVehicle({ ...editingVehicle, license_plate: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Usage
                    </label>
                    <select
                      value={editingVehicle.usage_pattern}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, usage_pattern: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="">Select usage pattern</option>
                      <option value="daily_commuter">Daily Commuter</option>
                      <option value="weekend_driver">Weekend Driver</option>
                      <option value="mixed">Mixed Usage</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Notes (do not enter maintenance information)
                    </label>
                    <textarea
                      placeholder="Example: minor accident damaged right wheel"
                      value={editingVehicle.usage_notes}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, usage_notes: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '60px', resize: 'vertical' }}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleUpdateVehicle(vehicle.id)} 
                    className="btn" 
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancelEdit} 
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <>
                <h3>
                  {vehicle.year} {vehicle.brand} {vehicle.model}
                  {vehicle.trim && ` ${vehicle.trim}`}
                </h3>
                {vehicle.license_plate && (
                  <p><strong>License:</strong> {vehicle.license_state && `${vehicle.license_state} `}{vehicle.license_plate}{vehicle.license_country && vehicle.license_country !== 'USA' && ` (${vehicle.license_country})`}</p>
                )}
                {vehicle.current_mileage && <p><strong>Mileage:</strong> {vehicle.current_mileage.toLocaleString()} miles</p>}
                {vehicle.zip_code && <p><strong>Location:</strong> {vehicle.zip_code}</p>}
                {vehicle.usage_pattern && <p><strong>Usage:</strong> {vehicle.usage_pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>}
                {vehicle.usage_notes && <p><strong>Notes:</strong> {vehicle.usage_notes}</p>}
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <Link to={`/maintenance/${vehicle.id}`}>
                    <button className="btn">
                      View Maintenance
                    </button>
                  </Link>
                  <button 
                    onClick={() => handleEditClick(vehicle)} 
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
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