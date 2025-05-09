import React, { useState } from 'react';
import LoginPage from './LoginPage';

function App() {
  const [page, setPage] = useState('landing');
  const [role, setRole] = useState('user'); // 'admin' or 'user'

  const handleLoginClick = () => setPage('login');
  const handleSignupClick = () => setPage('signup');
  const handleBackToLanding = () => setPage('landing');

  // Routing
  if (page === 'login') {
    return (
      <LoginPage
        role={role}
        onLogin={({ username }) => {
          localStorage.setItem('username', username);
          setPage(role === 'admin' ? 'dashboard' : 'userdashboard');
        }}
        onSwitchToSignup={handleSignupClick}
      />
    );
  }
  if (page === 'signup') {
    const SignupPage = require('./SignupPage').default;
    return (
      <SignupPage
        role={role}
        onSignup={({ username }) => {
          localStorage.setItem('username', username);
          setPage(role === 'admin' ? 'dashboard' : 'userdashboard');
        }}
        onSwitchToLogin={handleLoginClick}
      />
    );
  }
  if (page === 'dashboard') {
    const Dashboard = require('./Dashboard').default;
    return <Dashboard onLogout={handleBackToLanding} />;
  }
  if (page === 'userdashboard') {
    const UserDashboard = require('./UserDashboard').default;
    return <UserDashboard onLogout={handleBackToLanding} />;
  }

  // Beautified landing page with admin/user toggle
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 flex flex-col items-center">
          <span className="text-5xl mb-4 text-blue-600 drop-shadow">🧠</span>
          <h1 className="text-3xl font-extrabold mb-2 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            DeprAnx
          </h1>
          <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
            Depression/Anxiety Prediction App
          </h2>
          <div className="flex justify-center gap-2 mb-6 w-full">
            <button
              className={`flex-1 py-2 px-4 rounded-l-lg font-semibold text-lg transition duration-150 ${role === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-blue-600 hover:bg-blue-100'}`}
              onClick={() => setRole('admin')}
              type="button"
            >
              Admin Login
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-r-lg font-semibold text-lg transition duration-150 ${role === 'user' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 text-green-600 hover:bg-green-100'}`}
              onClick={() => setRole('user')}
              type="button"
            >
              User Login
            </button>
          </div>
          <p className="mb-2 text-center text-gray-600">
            Welcome! This app predicts depression or anxiety from your social media text — empowering you to understand and improve your mental health.
          </p>
          <p className="mb-6 text-center text-purple-500 italic font-medium">
            "Your words matter. Discover insights, take control."
          </p>
          <div className="flex justify-center gap-4 w-full">
            <button
              className={`flex-1 ${role === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 hover:bg-blue-500'} text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-200 text-lg`}
              type="button"
              onClick={handleLoginClick}
            >
              Login
            </button>
            <button
              className={`flex-1 ${role === 'user' ? 'bg-green-500 hover:bg-green-600' : 'bg-green-300 hover:bg-green-400'} text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-200 text-lg`}
              type="button"
              onClick={handleSignupClick}
            >
              Sign Up
            </button>
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} DeprAnx. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
