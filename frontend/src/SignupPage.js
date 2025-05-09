import React, { useState } from 'react';

function SignupPage({ onSignup, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await fetch('http://localhost:9101/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // Not JSON, ignore
      }
      if (!res.ok) {
        const detail = data && data.detail ? data.detail : res.statusText;
        throw new Error(detail || 'Signup failed');
      }
      onSignup({ username });
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Username</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-green-300"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-green-300"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-green-300"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200 mb-2"
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-2">
          <span>Already have an account? </span>
          <button
            className="text-blue-600 hover:underline font-semibold"
            onClick={onSwitchToLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
