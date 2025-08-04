import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to AdminDashboard
    navigate('/admin/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default Admin;