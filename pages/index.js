import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

export default function Home() {
  const router = useRouter();
  const [joinRoomId, setJoinRoomId] = useState('');

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    router.push(`/${roomId}/input`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      router.push(`/${joinRoomId.trim()}/input`);
    }
  };

  return (
    <>
      <Head>
        <title>Stream Soundboard</title>
        <meta name="description" content="Web-based soundboard for streamers" />
      </Head>
      <div className="home">
        <h1>Stream Soundboard</h1>
        <p>Play sounds on your stream with ease</p>

        <div className="home-actions">
          <button className="btn btn-primary" onClick={handleCreateRoom}>
            Create New Room
          </button>

          <div style={{ color: '#666', margin: '0.5rem 0' }}>or</div>

          <form className="join-form" onSubmit={handleJoinRoom}>
            <input
              type="text"
              placeholder="Enter room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              Join
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
