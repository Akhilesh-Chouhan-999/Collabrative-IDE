import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roomAPI } from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [rooms, setRooms] = useState({ created: [], joined: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [roomCode, setRoomCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(null);
  const { user, logout } = useAuth();
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
    } catch (err) {
      setError("Failed to fetch rooms");
      console.error(err);
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
        setRoomName("");
        navigate(`/room/${response.room._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await roomAPI.joinRoom(roomCode);
      if (response.success) {
        setShowJoinModal(false);
        setRoomCode("");
        navigate(`/room/${response.room._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join room");
    }
  };

  const handleDeleteRoom = async (code) => {
    try {
      const response = await roomAPI.deleteRoom(code);
      if (response.success) {
        setShowDeleteConfirm(null);
        fetchRooms();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete room");
      setShowDeleteConfirm(null);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(code);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleRoomClick = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      javascript: "JS",
      python: "PY",
      java: "JV",
      cpp: "C++",
      c: "C",
      html: "HTML",
      css: "CSS",
    };
    return icons[lang] || lang?.toUpperCase()?.slice(0, 3);
  };

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: "#f7df1e",
      python: "#3776ab",
      java: "#007396",
      cpp: "#00599c",
      c: "#a8b9cc",
      html: "#e34f26",
      css: "#1572b6",
    };
    return colors[lang] || "#667eea";
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Multi-Collab IDE</h1>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="user-name">{user?.username || "User"}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-number">{rooms.created.length}</span>
            <span className="stat-label">Rooms Created</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{rooms.joined.length}</span>
            <span className="stat-label">Rooms Joined</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {rooms.created.length + rooms.joined.length}
            </span>
            <span className="stat-label">Total Rooms</span>
          </div>
        </div>

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

        {error && (
          <div className="error-message">
            {error}
            <button className="dismiss-error" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        <div className="rooms-section">
          <div className="rooms-column">
            <h2>My Rooms</h2>
            <div className="rooms-list">
              {rooms.created.length === 0 ? (
                <div className="empty-state">
                  <p>No rooms created yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-action"
                  >
                    Create your first room
                  </button>
                </div>
              ) : (
                rooms.created.map((room) => (
                  <div key={room._id} className="room-card">
                    <div
                      className="room-card-main"
                      onClick={() => handleRoomClick(room._id)}
                    >
                      <div
                        className="room-card-icon"
                        style={{ background: getLanguageColor(room.language) }}
                      >
                        {getLanguageIcon(room.language)}
                      </div>
                      <div className="room-card-info">
                        <h3>{room.roomName}</h3>
                        <p className="room-language">{room.language}</p>
                        <div className="room-meta">
                          <span className="room-participants">
                            {room.participants?.length || 1} participants
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="room-card-actions">
                      <button
                        className="copy-code-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(room.roomCode);
                        }}
                        title="Copy room code"
                      >
                        {copySuccess === room.roomCode ? "✓" : "📋"}
                      </button>
                      <button
                        className="delete-room-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(room.roomCode);
                        }}
                        title="Delete room"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="room-code">Code: {room.roomCode}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rooms-column">
            <h2>Joined Rooms</h2>
            <div className="rooms-list">
              {rooms.joined.length === 0 ? (
                <div className="empty-state">
                  <p>No rooms joined yet</p>
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="inline-action"
                  >
                    Join a room
                  </button>
                </div>
              ) : (
                rooms.joined.map((room) => (
                  <div key={room._id} className="room-card">
                    <div
                      className="room-card-main"
                      onClick={() => handleRoomClick(room._id)}
                    >
                      <div
                        className="room-card-icon"
                        style={{ background: getLanguageColor(room.language) }}
                      >
                        {getLanguageIcon(room.language)}
                      </div>
                      <div className="room-card-info">
                        <h3>{room.roomName}</h3>
                        <p className="room-language">{room.language}</p>
                        <div className="room-meta">
                          <span className="room-participants">
                            {room.participants?.length || 1} participants
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="room-card-actions">
                      <button
                        className="copy-code-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(room.roomCode);
                        }}
                        title="Copy room code"
                      >
                        {copySuccess === room.roomCode ? "✓" : "📋"}
                      </button>
                    </div>
                    <div className="room-code">Code: {room.roomCode}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
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
                  autoFocus
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

      {/* Join Room Modal */}
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
                  placeholder="Paste room code here"
                  autoFocus
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="modal-content confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Delete Room?</h2>
            <p>
              This action cannot be undone. All messages and data in this room
              will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDeleteRoom(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
