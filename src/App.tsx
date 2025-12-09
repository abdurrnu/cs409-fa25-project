import React, { useState } from 'react';
import './App.css';
import { AuthForm } from './AuthForm';
import { Dashboard } from './Dashboard';
import { User } from './api';

function App() {
  // store the full logged-in user, not just their email
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
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
