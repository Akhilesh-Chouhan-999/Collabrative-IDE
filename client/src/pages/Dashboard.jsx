import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [rooms, setRooms] = useState({ created: [], joined: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [roomCode, setRoomCode] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getRoomsForUser();
      if (response.success) {
        setRooms(response.rooms);
      }
    } catch (error) {
      setError('Failed to fetch rooms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await roomAPI.createRoom(language, roomName);
      if (response.success) {
        setShowCreateModal(false);
        setRoomName('');
        fetchRooms();
        navigate(`/room/${response.room._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await roomAPI.joinRoom(roomCode);
      if (response.success) {
        setShowJoinModal(false);
        setRoomCode('');
        fetchRooms();
        navigate(`/room/${response.room._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join room');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRoomClick = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Multi-Collab IDE</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button
            onClick={() => setShowCreateModal(true)}
            className="action-button create-button"
          >
            + Create Room
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="action-button join-button"
          >
            Join Room
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="rooms-section">
          <div className="rooms-column">
            <h2>My Rooms</h2>
            <div className="rooms-list">
              {rooms.created.length === 0 ? (
                <p className="empty-state">No rooms created yet</p>
              ) : (
                rooms.created.map((room) => (
                  <div
                    key={room._id}
                    className="room-card"
                    onClick={() => handleRoomClick(room._id)}
                  >
                    <h3>{room.roomName}</h3>
                    <p className="room-language">{room.language}</p>
                    <p className="room-code">Code: {room.roomCode}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rooms-column">
            <h2>Joined Rooms</h2>
            <div className="rooms-list">
              {rooms.joined.length === 0 ? (
                <p className="empty-state">No rooms joined yet</p>
              ) : (
                rooms.joined.map((room) => (
                  <div
                    key={room._id}
                    className="room-card"
                    onClick={() => handleRoomClick(room._id)}
                  >
                    <h3>{room.roomName}</h3>
                    <p className="room-language">{room.language}</p>
                    <p className="room-code">Code: {room.roomCode}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label>Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  placeholder="Enter room name"
                />
              </div>
              <div className="form-group">
                <label>Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Join Room</h2>
            <form onSubmit={handleJoinRoom}>
              <div className="form-group">
                <label>Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  required
                  placeholder="Enter room code"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </button>
                <button type="submit">Join</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

