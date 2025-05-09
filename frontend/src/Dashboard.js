import React, { useState, useEffect } from 'react';

function Dashboard({ onLogout }) {
  // Admin Chat RL Panel State
  const [chatLogs, setChatLogs] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    // Fetch chat logs for admin review
    const fetchChats = async () => {
      setLoadingChats(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:9100/admin/chatlogs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setChatLogs(data.logs || []);
      } catch {
        setChatLogs([]);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  const handleFeedback = (id, type, suggestion) => {
    setFeedback(fb => ({ ...fb, [id]: { type, suggestion } }));
    // TODO: send feedback to backend for RL
  };

  const username = localStorage.getItem('username') || 'User';
  const [selectedFile, setSelectedFile] = useState(null);
  const [text, setText] = useState('');
  const [fileMessage, setFileMessage] = useState('');
  const [predictMessage, setPredictMessage] = useState('');
  const [trainFile, setTrainFile] = useState(null);
  const [trainMessage, setTrainMessage] = useState('');
  const [loading, setLoading] = useState({ upload: false, predict: false, train: false });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFileMessage(e.target.files[0] ? `Selected: ${e.target.files[0].name}` : '');
  };

  const handleUpload = async () => {
    setFileMessage('');
    setLoading(l => ({ ...l, upload: true }));
    if (!selectedFile) {
      setFileMessage('No file selected');
      setLoading(l => ({ ...l, upload: false }));
      return;
    }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await fetch('http://localhost:9100/predict-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Upload failed');
      }
      const data = await res.json();
      setFileMessage(`Predictions received: ${data.length}`);
    } catch (err) {
      setFileMessage(err.message || 'Upload failed');
    } finally {
      setLoading(l => ({ ...l, upload: false }));
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    setPredictMessage('');
  };

  const handlePredict = async () => {
    setPredictMessage('');
    setLoading(l => ({ ...l, predict: true }));
    if (!text.trim()) {
      setPredictMessage('Please enter some text');
      setLoading(l => ({ ...l, predict: false }));
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
      } catch (jsonErr) {
        // Not JSON
      }
      if (!res.ok) {
        const detail = data && data.detail ? data.detail : res.statusText;
        throw new Error(detail || 'Prediction failed');
      }
      setPredictMessage(`Result: ${data.result} (prob: ${data.probability.toFixed(2)}, severity: ${data.severity})`);
    } catch (err) {
      setPredictMessage(err.message || 'Prediction failed');
    } finally {
      setLoading(l => ({ ...l, predict: false }));
    }
  };

  // Training handlers
  const handleTrainFileChange = (e) => {
    setTrainFile(e.target.files[0]);
    setTrainMessage(e.target.files[0] ? `Selected: ${e.target.files[0].name}` : '');
  };

  const handleTrain = async () => {
    setTrainMessage('');
    setLoading(l => ({ ...l, train: true }));
    if (!trainFile) {
      setTrainMessage('No training file selected');
      setLoading(l => ({ ...l, train: false }));
      return;
    }
    const token = localStorage.getItem('token');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      try {
        const res = await fetch('http://localhost:9100/train-model', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ csv_data: csvData })
        });
        let data = null;
        try {
          data = await res.json();
        } catch (jsonErr) {}
        if (!res.ok) {
          const detail = data && data.detail ? data.detail : res.statusText;
          throw new Error(detail || 'Training failed');
        }
        setTrainMessage(`Model trained! Metrics: ${JSON.stringify(data.metrics)}`);
      } catch (err) {
        setTrainMessage(err.message || 'Training failed');
      } finally {
        setLoading(l => ({ ...l, train: false }));
      }
    };
    reader.readAsText(trainFile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col">
      {/* Header Bar */}
      <header className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 shadow-lg py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white text-3xl">🧠</span>
          <span className="text-white text-2xl font-bold tracking-wide">DeprAnx Dashboard</span>
        </div>
        <button
          className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-6 rounded shadow transition duration-200"
          onClick={onLogout}
        >
          Logout
        </button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-2">
        <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="text-blue-600">👋</span> Welcome, <span className="text-purple-600">{username}</span>!
          </h2>
          <p className="mb-8 text-gray-600">You are now logged in. Explore the features below.</p>

          {/* Upload Section */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-500 text-xl">📤</span>
              <h3 className="text-lg font-semibold">Upload Social Media Data</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input type="file" className="mb-2 sm:mb-0 sm:mr-2" onChange={handleFileChange} />
              <button
                className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded shadow transition duration-200 flex items-center gap-2 ${loading.upload ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handleUpload}
                type="button"
                disabled={loading.upload}
              >
                {loading.upload ? <span className="animate-spin">🔄</span> : <span>⬆️</span>}
                Upload
              </button>
            </div>
            <div className={`text-sm mt-2 ${fileMessage.includes('received') ? 'text-green-600' : fileMessage ? 'text-red-500' : 'text-gray-600'}`}>{fileMessage}</div>
          </section>

          {/* Predict Section */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-500 text-xl">💬</span>
              <h3 className="text-lg font-semibold">Real-time Text Prediction</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                className="border px-3 py-2 rounded w-80 max-w-full focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="Type your text here..."
                value={text}
                onChange={handleTextChange}
              />
              <button
                className={`bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded shadow transition duration-200 flex items-center gap-2 ${loading.predict ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handlePredict}
                type="button"
                disabled={loading.predict}
              >
                {loading.predict ? <span className="animate-spin">🔄</span> : <span>🤖</span>}
                Predict
              </button>
            </div>
            <div className={`text-sm mt-2 ${predictMessage.startsWith('Result:') ? 'text-green-600' : predictMessage ? 'text-red-500' : 'text-gray-600'}`}>{predictMessage}</div>
          </section>

          {/* Train Section */}
          <section className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-purple-500 text-xl">🛠️</span>
              <h3 className="text-lg font-semibold">Train Model</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input type="file" accept=".csv" className="mb-2 sm:mb-0 sm:mr-2" onChange={handleTrainFileChange} />
              <button
                className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded shadow transition duration-200 flex items-center gap-2 ${loading.train ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handleTrain}
                type="button"
                disabled={loading.train}
              >
                {loading.train ? <span className="animate-spin">🔄</span> : <span>⚡</span>}
                Train
              </button>
            </div>
            <div className={`text-sm mt-2 ${trainMessage.includes('trained') ? 'text-green-600' : trainMessage ? 'text-red-500' : 'text-gray-600'}`}>{trainMessage}</div>
          </section>

          {/* Visualizations Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-pink-500 text-xl">📊</span>
              <h3 className="text-lg font-semibold">Visualizations</h3>
            </div>
            <div className="h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded flex items-center justify-center text-gray-500 shadow-inner border border-pink-200">
              Charts & Word Clouds (Coming Soon)
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
