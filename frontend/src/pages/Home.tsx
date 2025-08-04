import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '10px' }}>
          CarLog
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          Smart car maintenance tracking with SMS notifications
        </p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            Never Miss Another Oil Change
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
            CarLog helps car owners stay on top of their vehicle maintenance with intelligent 
            tracking and timely SMS reminders. Keep detailed records of all your services and 
            get notified when it's time for your next maintenance.
          </p>
        </section>

        <section style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #1976d2',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '40px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1976d2', textAlign: 'center' }}>
            What Our AI Analyzes
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', textAlign: 'left', paddingLeft: '80px' }}>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ color: '#1565c0' }}>Immediate Needs:</strong>
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', textAlign: 'left' }}>
                <li>Urgent maintenance items</li>
                <li>Safety-critical services</li>
                <li>Overdue maintenance</li>
              </ul>
            </div>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ color: '#1565c0' }}>Scheduled Services:</strong>
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', textAlign: 'left' }}>
                <li>Upcoming maintenance by mileage</li>
                <li>Time-based service intervals</li>
                <li>Manufacturer recommendations</li>
              </ul>
            </div>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ color: '#1565c0' }}>Model-Specific Insights:</strong>
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', textAlign: 'left' }}>
                <li>Known issues for your model</li>
                <li>Preventive measures</li>
                <li>Recall information</li>
              </ul>
            </div>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ color: '#1565c0' }}>Cost Estimates:</strong>
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', textAlign: 'left' }}>
                <li>Service cost ranges</li>
                <li>Priority-based budgeting</li>
                <li>Location-specific pricing</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            Key Features
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>🤖 AI-Powered Prevention</h3>
              <p>Get model-specific recommendations to prevent known issues before they occur</p>
            </div>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>🔔 Fully Automated Smart Reminders</h3>
              <p>Get timely notifications on your schedule - weekly, monthly, or quarterly</p>
            </div>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>📱 SMS Integration</h3>
              <p>Update your mileage and maintenance records via simple text messages</p>
            </div>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>📊 Complete Records</h3>
              <p>Track all maintenance history with costs, dates, and service providers</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>1</div>
              <p style={{ margin: 0 }}>Register your vehicles and set up maintenance schedules</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>2</div>
              <p style={{ margin: 0 }}>Receive SMS reminders when maintenance is due</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>3</div>
              <p style={{ margin: 0 }}>Update records via SMS or web interface</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>4</div>
              <p style={{ margin: 0 }}>Keep your car running smoothly with proactive maintenance</p>
            </div>
          </div>
        </section>

        <section style={{ 
          textAlign: 'center', 
          backgroundColor: '#f9f9f9', 
          padding: '30px', 
          borderRadius: '8px', 
          marginBottom: '40px' 
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            Ready to Get Started?
          </h2>
          <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
            Join thousands of car owners who never miss their maintenance schedules
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <button className="btn" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
                Sign Up Now
              </button>
            </Link>
            <Link to="/login">
              <button className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
                Login
              </button>
            </Link>
          </div>
        </section>

        <footer style={{ 
          borderTop: '1px solid #ddd', 
          paddingTop: '20px', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link to="/sms-opt-out" style={{ color: '#666', textDecoration: 'none' }}>
              SMS Opt-out
            </Link>
            <Link to="/unsubscribe" style={{ color: '#666', textDecoration: 'none' }}>
              Unsubscribe
            </Link>
          </div>
          <p style={{ marginTop: '10px', marginBottom: 0 }}>
            © 2025 CarLog. Keep your car running smoothly.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;