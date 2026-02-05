import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { connectSocket, disconnectSocket } from '../../lib/socket';

export default function OutputPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [sounds, setSounds] = useState([]);
  const audioRefs = useRef({});
  const [activeGifs, setActiveGifs] = useState([]);

  // Fetch sounds to pre-load
  const fetchSounds = useCallback(async () => {
    if (!roomId) return;

    try {
      const res = await fetch(`/api/sounds?roomId=${roomId}`);
      const data = await res.json();
      // Flatten preset categories into array
      const presetSounds = Object.values(data.presetCategories || {}).flat();
      setSounds([...presetSounds, ...(data.customSounds || [])]);
    } catch (error) {
      console.error('Failed to fetch sounds:', error);
    }
  }, [roomId]);

  // Connect to socket
  useEffect(() => {
    if (!roomId) return;

    const socket = connectSocket();

    socket.on('connect', () => {
      socket.emit('join-room', { roomId, role: 'output' });
    });

    socket.on('sound-triggered', ({ soundId, soundUrl }) => {
      console.log('Sound triggered:', soundId, soundUrl);
      playSound(soundUrl);
    });

    socket.on('gif-triggered', ({ gifId, gifUrl, position, animation, duration }) => {
      console.log('GIF triggered:', gifId, gifUrl);
      const id = `${gifId}-${Date.now()}`;

      setActiveGifs(prev => [...prev, { id, gifUrl, position, animation, duration }]);

      // Remove after duration
      setTimeout(() => {
        setActiveGifs(prev => prev.filter(g => g.id !== id));
      }, duration || 3000);
    });

    socket.on('sounds-updated', () => {
      fetchSounds();
    });

    fetchSounds();

    return () => {
      socket.off('connect');
      socket.off('sound-triggered');
      socket.off('gif-triggered');
      socket.off('sounds-updated');
      disconnectSocket();
    };
  }, [roomId, fetchSounds]);

  // Play sound function
  const playSound = (url) => {
    const audio = new Audio(url);
    audio.volume = 1.0;
    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });
  };

  return (
    <>
      <Head>
        <title>{`Output - ${roomId || ''}`}</title>
        <style>{`
          body {
            background: transparent !important;
          }
        `}</style>
      </Head>
      <div className="output-page">
        {/* GIF overlay */}
        <div className="gif-overlay">
          {activeGifs.map((gif) => (
            <div
              key={gif.id}
              className={`gif-container ${gif.position || 'center'}`}
            >
              <img
                src={gif.gifUrl}
                alt=""
                className={`gif-anim-${gif.animation || 'fade'}`}
                style={{ '--gif-duration': `${(gif.duration || 3000) / 1000}s` }}
              />
            </div>
          ))}
        </div>

        {/* Hidden audio elements for preloading */}
        <div className="output-hidden">
          {sounds.map((sound) => (
            <audio
              key={sound.id}
              ref={(el) => {
                if (el) audioRefs.current[sound.id] = el;
              }}
              src={sound.url}
              preload="auto"
            />
          ))}
        </div>
      </div>
    </>
  );
}
