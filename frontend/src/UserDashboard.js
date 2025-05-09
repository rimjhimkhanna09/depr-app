import React, { useState } from 'react';
import Chatbot from './Chatbot';

function UserDashboard({ onLogout }) {
  const username = localStorage.getItem('username') || 'User';
  const [text, setText] = useState('');
  const [predictMessage, setPredictMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTextChange = (e) => {
    setText(e.target.value);
    setPredictMessage('');
  };

  const handlePredict = async () => {
    setPredictMessage('');
    setLoading(true);
    if (!text.trim()) {
      setPredictMessage('Please enter some text');
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:9100/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {}
      if (!res.ok) {
        const detail = data && data.detail ? data.detail : res.statusText;
        throw new Error(detail || 'Prediction failed');
      }
      setPredictMessage(`Result: ${data.result} (prob: ${data.probability.toFixed(2)}, severity: ${data.severity})`);
    } catch (err) {
      setPredictMessage(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 flex flex-col">
      <header className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-lg py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white text-3xl">😊</span>
          <span className="text-white text-2xl font-bold tracking-wide">DeprAnx User</span>
        </div>
        <button
          className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-6 rounded shadow transition duration-200"
          onClick={onLogout}
        >
          Logout
        </button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-2">
        <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-xl border border-gray-100 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="text-green-600">👋</span> Hi, <span className="text-blue-600">{username}</span>!
          </h2>
          <p className="mb-8 text-gray-600 text-center">Welcome to your personal wellness assistant. Chat with our supportive bot below, or enter your thoughts for instant encouragement!</p>
          <Chatbot username={username} />
          <div className="mt-8 text-center text-purple-500 font-semibold">
            Remember: <span className="italic">You are not alone. This tool is here to support you!</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
