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
  const [activeTab, setActiveTab] = useState('sounds');
  const [presetGifCategories, setPresetGifCategories] = useState({});
  const [customGifs, setCustomGifs] = useState([]);
  const [playingGif, setPlayingGif] = useState(null);
  const [gifUploadStatus, setGifUploadStatus] = useState(null);
  const [addGifMode, setAddGifMode] = useState('upload'); // 'upload' or 'url'
  const [selectedGifFile, setSelectedGifFile] = useState(null);
  const [gifFormData, setGifFormData] = useState({
    name: '',
    url: '',
  });
  const [gifDisplaySettings, setGifDisplaySettings] = useState({
    position: 'center',
    animation: 'fade',
    duration: 3000,
  });

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

  // Fetch GIFs list
  const fetchGifs = useCallback(async () => {
    if (!roomId) return;

    try {
      const res = await fetch(`/api/gifs?roomId=${roomId}`);
      const data = await res.json();
      setPresetGifCategories(data.presetCategories || {});
      setCustomGifs(data.customGifs || []);
    } catch (error) {
      console.error('Failed to fetch GIFs:', error);
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

    s.on('gifs-updated', () => {
      fetchGifs();
    });

    fetchSounds();
    fetchGifs();

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('sounds-updated');
      s.off('gifs-updated');
      disconnectSocket();
    };
  }, [roomId, fetchSounds, fetchGifs]);

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

  // Play GIF handler - uses global display settings
  const handlePlayGif = (gif) => {
    if (!socket || !connected) return;

    setPlayingGif(gif.id);
    socket.emit('play-gif', {
      roomId,
      gifId: gif.id,
      gifUrl: gif.url,
      position: gifDisplaySettings.position,
      animation: gifDisplaySettings.animation,
      duration: gifDisplaySettings.duration,
    });

    setTimeout(() => setPlayingGif(null), 300);
  };

  // GIF Upload handler
  const handleGifUpload = async (e) => {
    e.preventDefault();

    if (!selectedGifFile) {
      setGifUploadStatus({ type: 'error', message: 'Please select a file' });
      return;
    }

    setGifUploadStatus({ type: 'info', message: 'Uploading...' });

    const formData = new FormData();
    formData.append('file', selectedGifFile);
    formData.append('name', gifFormData.name || '');

    try {
      const res = await fetch(`/api/gifs/upload?roomId=${roomId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setGifUploadStatus({ type: 'success', message: `Uploaded: ${data.gif.name}` });
        fetchGifs();
        setSelectedGifFile(null);
        setGifFormData({ name: '', url: '' });
      } else {
        setGifUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch (error) {
      setGifUploadStatus({ type: 'error', message: 'Upload failed' });
    }

    setTimeout(() => setGifUploadStatus(null), 3000);
  };

  // GIF URL handler
  const handleGifUrl = async (e) => {
    e.preventDefault();

    if (!gifFormData.url) {
      setGifUploadStatus({ type: 'error', message: 'Please enter a URL' });
      return;
    }

    setGifUploadStatus({ type: 'info', message: 'Adding...' });

    try {
      const res = await fetch(`/api/gifs/url?roomId=${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: gifFormData.name, url: gifFormData.url }),
      });

      const data = await res.json();

      if (res.ok) {
        setGifUploadStatus({ type: 'success', message: `Added: ${data.gif.name}` });
        fetchGifs();
        setGifFormData({ name: '', url: '' });
      } else {
        setGifUploadStatus({ type: 'error', message: data.error || 'Failed to add' });
      }
    } catch (error) {
      setGifUploadStatus({ type: 'error', message: 'Failed to add' });
    }

    setTimeout(() => setGifUploadStatus(null), 3000);
  };

  // GIF Delete handler
  const handleDeleteGif = async (gif) => {
    if (!confirm(`Delete "${gif.name}"?`)) return;

    try {
      const params = new URLSearchParams({ roomId });
      if (gif.type === 'url') {
        params.append('id', gif.id);
      } else {
        params.append('filename', gif.filename);
      }

      const res = await fetch(`/api/gifs/delete?${params}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchGifs();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete GIF');
      }
    } catch (error) {
      alert('Failed to delete GIF');
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

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'sounds' ? 'active' : ''}`}
            onClick={() => setActiveTab('sounds')}
          >
            Sounds
          </button>
          <button
            className={`tab-btn ${activeTab === 'gifs' ? 'active' : ''}`}
            onClick={() => setActiveTab('gifs')}
          >
            GIFs
          </button>
        </div>

        {/* Sounds Tab */}
        {activeTab === 'sounds' && (
          <>
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
          </>
        )}

        {/* GIFs Tab */}
        {activeTab === 'gifs' && (
          <>
            {/* Display Settings */}
            <div className="gif-display-settings">
              <h3>Display Settings</h3>
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem' }}>
                These settings apply when you click any GIF below
              </p>
              <div className="gif-form-row">
                <label>
                  Position
                  <select
                    value={gifDisplaySettings.position}
                    onChange={(e) => setGifDisplaySettings({ ...gifDisplaySettings, position: e.target.value })}
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="middle-left">Middle Left</option>
                    <option value="center">Center</option>
                    <option value="middle-right">Middle Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </label>

                <label>
                  Animation
                  <select
                    value={gifDisplaySettings.animation}
                    onChange={(e) => setGifDisplaySettings({ ...gifDisplaySettings, animation: e.target.value })}
                  >
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="bounce">Bounce</option>
                    <option value="shake">Shake</option>
                    <option value="spin">Spin</option>
                    <option value="zoom">Zoom</option>
                    <option value="wiggle">Wiggle</option>
                    <option value="bounce-around">Bounce Around</option>
                  </select>
                </label>

                <label>
                  Duration (seconds)
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={gifDisplaySettings.duration / 1000}
                    onChange={(e) => setGifDisplaySettings({ ...gifDisplaySettings, duration: parseFloat(e.target.value) * 1000 })}
                  />
                </label>
              </div>
            </div>

            <h2 style={{ marginBottom: '1rem', marginTop: Object.keys(presetGifCategories).length > 0 ? '2rem' : 0 }}>
              Custom GIFs
            </h2>
            {customGifs.length > 0 ? (
              <div className="gif-grid">
                {customGifs.map((gif) => (
                  <div key={gif.id} className="gif-item">
                    <button
                      className={`gif-btn ${playingGif === gif.id ? 'playing' : ''}`}
                      onClick={() => handlePlayGif(gif)}
                      disabled={!connected}
                    >
                      <img src={gif.url} alt={gif.name} />
                      <span className="gif-name">{gif.name}</span>
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteGif(gif)}
                      title="Delete GIF"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', marginBottom: '1rem' }}>No custom GIFs yet. Add one below!</p>
            )}

            <div className="add-gif-section">
              <h2>Add GIF</h2>

              <div className="add-gif-tabs">
                <button
                  className={addGifMode === 'upload' ? 'active' : ''}
                  onClick={() => setAddGifMode('upload')}
                >
                  Upload File
                </button>
                <button
                  className={addGifMode === 'url' ? 'active' : ''}
                  onClick={() => setAddGifMode('url')}
                >
                  Paste URL
                </button>
              </div>

              <form className="gif-form" onSubmit={addGifMode === 'upload' ? handleGifUpload : handleGifUrl}>
                {addGifMode === 'upload' ? (
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="gif-file-upload"
                      accept=".gif,.webp,.png,.apng"
                      onChange={(e) => setSelectedGifFile(e.target.files[0] || null)}
                    />
                    <label
                      htmlFor="gif-file-upload"
                      className={`file-input-label ${selectedGifFile ? 'has-file' : ''}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {selectedGifFile ? 'Change file' : 'Choose GIF'}
                    </label>
                    {selectedGifFile && <span className="file-name">{selectedGifFile.name}</span>}
                  </div>
                ) : (
                  <label>
                    GIF URL
                    <input
                      type="url"
                      placeholder="https://media.giphy.com/..."
                      value={gifFormData.url}
                      onChange={(e) => setGifFormData({ ...gifFormData, url: e.target.value })}
                    />
                  </label>
                )}

                <label>
                  Name (optional)
                  <input
                    type="text"
                    placeholder="My GIF"
                    value={gifFormData.name}
                    onChange={(e) => setGifFormData({ ...gifFormData, name: e.target.value })}
                  />
                </label>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={addGifMode === 'upload' ? !selectedGifFile : !gifFormData.url}
                  >
                    {addGifMode === 'upload' ? 'Upload' : 'Add GIF'}
                  </button>
                </div>
              </form>

              {gifUploadStatus && (
                <div className={`upload-status ${gifUploadStatus.type}`}>
                  {gifUploadStatus.message}
                </div>
              )}
            </div>

            {Object.keys(presetGifCategories).length > 0 && (
              <>
                {Object.entries(presetGifCategories).map(([category, gifs]) => (
                  <div key={category} className="sound-category">
                    <h3 className="category-title">{category}</h3>
                    <div className="gif-grid">
                      {gifs.map((gif) => (
                        <button
                          key={gif.id}
                          className={`gif-btn ${playingGif === gif.id ? 'playing' : ''}`}
                          onClick={() => handlePlayGif(gif)}
                          disabled={!connected}
                        >
                          <img src={gif.url} alt={gif.name} />
                          <span className="gif-name">{gif.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
