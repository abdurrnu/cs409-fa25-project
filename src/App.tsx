import React, { useState } from 'react';
import './App.css';
import { AuthForm } from './AuthForm';
import { Dashboard } from './Dashboard';

function App() {
  const [user, setUser] = useState<string | null>(null);

  const handleLogin = (email: string) => {
    // Extract NetID from email for display if needed, or just store email
    setUser(email);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;