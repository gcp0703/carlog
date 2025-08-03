import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';
import Unsubscribe from './pages/Unsubscribe';
import SmsOptOut from './pages/SmsOptOut';
import { AuthProvider } from './components/auth/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/sms-opt-out" element={<SmsOptOut />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/vehicles"
              element={
                <PrivateRoute>
                  <Vehicles />
                </PrivateRoute>
              }
            />
            <Route
              path="/maintenance/:vehicleId"
              element={
                <PrivateRoute>
                  <Maintenance />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;