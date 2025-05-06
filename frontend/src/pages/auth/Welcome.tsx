import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to Our Application!</h1>
      <p>
        Thank you for registering your school. We are thrilled to have you on board!
      </p>
      <p>
        Your school registration is under review. You will receive an email notification once your school is approved.
      </p>
      <p>
        In the meantime, feel free to explore our platform. Once approved, you can start using the application to its full potential.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Go to Home
      </button>
    </div>
  );
};

export default Welcome;
