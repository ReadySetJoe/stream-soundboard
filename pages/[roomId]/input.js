import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { connectSocket, disconnectSocket } from '../../lib/socket';

export default function InputPage() {
  const router = useRouter();
  const { roomId } = router.query;

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [presetCategories, setPresetCategories] = useState({});
  const [customSounds, setCustomSounds] = useState([]);
  const [playingSound, setPlayingSound] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [outputUrl, setOutputUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch sounds list
  const fetchSounds = useCallback(async () => {
    if (!roomId) return;

    try {
      const res = await fetch(`/api/sounds?roomId=${roomId}`);
      const data = await res.json();
      setPresetCategories(data.presetCategories || {});
      setCustomSounds(data.customSounds || []);
    } catch (error) {
      console.error('Failed to fetch sounds:', error);
    }
  }, [roomId]);

  // Connect to socket
  useEffect(() => {
    if (!roomId) return;

    const s = connectSocket();
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      s.emit('join-room', { roomId, role: 'input' });
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('sounds-updated', () => {
      fetchSounds();
    });

    fetchSounds();

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('sounds-updated');
      disconnectSocket();
    };
  }, [roomId, fetchSounds]);

  // Play sound handler
  const handlePlaySound = (sound) => {
    if (!socket || !connected) return;

    setPlayingSound(sound.id);
    socket.emit('play-sound', {
      roomId,
      soundId: sound.id,
      soundUrl: sound.url,
    });

    setTimeout(() => setPlayingSound(null), 300);
  };

  // Upload handler
  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('file');

    if (!file || !file.name) {
      setUploadStatus({ type: 'error', message: 'Please select a file' });
      return;
    }

    setUploadStatus({ type: 'info', message: 'Uploading...' });

    try {
      const res = await fetch(`/api/upload?roomId=${roomId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadStatus({ type: 'success', message: `Uploaded: ${data.sound.name}` });
        fetchSounds();
        e.target.reset();
        setSelectedFile(null);
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Upload failed' });
    }

    setTimeout(() => setUploadStatus(null), 3000);
  };

  // Delete handler
  const handleDelete = async (sound) => {
    if (!confirm(`Delete "${sound.name}"?`)) return;

    try {
      const res = await fetch(`/api/delete?roomId=${roomId}&filename=${encodeURIComponent(sound.filename)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchSounds();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete sound');
      }
    } catch (error) {
      alert('Failed to delete sound');
    }
  };

  // Set output URL on client only to avoid hydration mismatch
  useEffect(() => {
    if (roomId) {
      setOutputUrl(`${window.location.origin}/${roomId}/output`);
    }
  }, [roomId]);

  return (
    <>
      <Head>
        <title>{`JOE-BS Soundboard - ${roomId || ''}`}</title>
      </Head>
      <div className="input-page container">
        <h1>JOE-BS Soundboard</h1>
        <p className="room-info">
          Room: <strong>{roomId}</strong>
        </p>

        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {connected ? 'Connected' : 'Disconnected'}
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#2d2d44', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>
            Browser Source URL for OBS:
          </p>
          <code style={{ color: '#4ecdc4', wordBreak: 'break-all' }}>{outputUrl}</code>
        </div>

        {Object.keys(presetCategories).length > 0 && (
          <>
            {Object.entries(presetCategories).map(([category, sounds]) => (
              <div key={category} className="sound-category">
                <h3 className="category-title">{category}</h3>
                <div className="sound-grid">
                  {sounds.map((sound) => (
                    <button
                      key={sound.id}
                      className={`sound-btn ${playingSound === sound.id ? 'playing' : ''}`}
                      onClick={() => handlePlaySound(sound)}
                      disabled={!connected}
                    >
                      {sound.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        <h2 style={{ marginBottom: '1rem', marginTop: Object.keys(presetCategories).length > 0 ? '2rem' : 0 }}>
          Custom Sounds
        </h2>
        {customSounds.length > 0 ? (
          <div className="sound-grid">
            {customSounds.map((sound) => (
              <div key={sound.id} className="sound-item">
                <button
                  className={`sound-btn ${playingSound === sound.id ? 'playing' : ''}`}
                  onClick={() => handlePlaySound(sound)}
                  disabled={!connected}
                >
                  {sound.name}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(sound)}
                  title="Delete sound"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', marginBottom: '1rem' }}>No custom sounds yet. Upload one below!</p>
        )}

        <div className="upload-section">
          <h2>Upload Custom Sound</h2>
          <form className="upload-form" onSubmit={handleUpload}>
            <div className="file-input-wrapper">
              <input
                type="file"
                name="file"
                id="file-upload"
                accept=".mp3,.wav,.ogg"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              />
              <label
                htmlFor="file-upload"
                className={`file-input-label ${selectedFile ? 'has-file' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {selectedFile ? 'Change file' : 'Choose file'}
              </label>
              {selectedFile && <span className="file-name">{selectedFile.name}</span>}
            </div>
            <input type="text" name="name" placeholder="Sound name (optional)" />
            <button type="submit" className="btn btn-primary" disabled={!selectedFile}>
              Upload
            </button>
          </form>
          {uploadStatus && (
            <div className={`upload-status ${uploadStatus.type}`}>
              {uploadStatus.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
