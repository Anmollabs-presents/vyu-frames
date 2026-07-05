'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Showcase from '../components/Showcase';
import EditorModal from '../components/EditorModal';

const DEFAULT_DATA = {
  siteName: 'vyu.frames',
  logoVersion: 0,
  images: [],
};

export default function Home() {
  const [theme, setTheme] = useState('black');
  const [data, setData] = useState(DEFAULT_DATA);
  const [showEditor, setShowEditor] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('vyu-theme');
    if (savedTheme) setTheme(savedTheme);

    const fetchData = async () => {
      try {
        const res = await fetch('/api/get-data');
        const result = await res.json();
        if (result.success) setData({ ...DEFAULT_DATA, ...result.data });
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHoldComplete = () => {
    setPinError('');
    setPinInput('');
    setShowPinModal(true);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const result = await res.json();
      if (result.success) {
        setAuthToken(result.token);
        setShowPinModal(false);
        setPinInput('');
        setShowEditor(true);
      } else {
        setPinError('Incorrect PIN. Try again.');
        setPinInput('');
      }
    } catch {
      setPinError('Something went wrong. Try again.');
    }
  };

  const handleSaveData = async (newData) => {
    try {
      const res = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(newData),
      });
      const result = await res.json();
      if (result.success) {
        setData(newData);
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to save' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0b0b', color: '#f0ebe3', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar
        siteName={data.siteName}
        theme={theme}
        setTheme={setTheme}
        logoVersion={data.logoVersion}
        onHoldComplete={handleHoldComplete}
      />

      <Showcase images={data.images || []} />

      {/* PIN modal */}
      {showPinModal && (
        <div className="editor-overlay" onClick={() => setShowPinModal(false)}>
          <div
            className="editor-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px' }}
          >
            <button className="close-btn" onClick={() => setShowPinModal(false)}>×</button>
            <h2>Enter PIN</h2>
            <p style={{ color: 'var(--dimmed)', marginBottom: '20px', fontSize: '0.9rem' }}>
              Enter the access code to unlock the editor.
            </p>
            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••"
                maxLength="12"
                style={{
                  width: '100%', padding: '14px', fontSize: '1.5rem', letterSpacing: '0.3em',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: '#fff', textAlign: 'center',
                  fontFamily: 'Inter, sans-serif',
                }}
                autoFocus
              />
              {pinError && (
                <p style={{ color: '#c04040', marginTop: '10px', fontSize: '0.85rem' }}>{pinError}</p>
              )}
              <button
                type="submit"
                className="editor-save-btn"
                style={{ width: '100%', marginTop: '16px' }}
              >
                Unlock Editor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Editor */}
      {showEditor && (
        <EditorModal
          data={data}
          authToken={authToken}
          onSave={handleSaveData}
          onClose={() => setShowEditor(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
