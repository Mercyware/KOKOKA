
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthPageProps {
  onAuthSuccess: (user: { name: string; email: string; role: string }) => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (email: string, password: string) => {
    // In a real app, you would validate credentials here
    console.log('Login attempt:', { email, password });
    
    // Mock successful login
    onAuthSuccess({
      name: 'John Doe',
      email: email,
      role: 'Administrator'
    });
  };

  const handleRegister = (name: string, email: string, password: string, role: string) => {
    // In a real app, you would create the account here
    console.log('Register attempt:', { name, email, password, role });
    
    // Mock successful registration
    onAuthSuccess({
      name: name,
      email: email,
      role: role
    });
  };

  return (
    <>
      {isLogin ? (
        <LoginForm
          onSwitchToRegister={() => setIsLogin(false)}
          onLogin={handleLogin}
        />
      ) : (
        <RegisterForm
          onSwitchToLogin={() => setIsLogin(true)}
          onRegister={handleRegister}
        />
      )}
    </>
  );
};

export default AuthPage;
