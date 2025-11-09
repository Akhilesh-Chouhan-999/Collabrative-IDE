import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { roomAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Room.css';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const editorRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchRoom();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (room && socket) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRoom = async () => {
    try {
      const response = await roomAPI.getRoomById(roomId);
      if (response.success) {
        setRoom(response.room);
        setLanguage(response.room.language);
        setCode(response.room.code || '');
        initializeSocket(response.room);
      } else {
        setError('Room not found');
      }
    } catch (error) {
      setError('Failed to load room');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = (roomData) => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join-room', {
        id: roomData._id,
        nameOfUser: user?.username || 'User',
      });
    });

    newSocket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on('code-update', (newCode) => {
      if (newCode !== code) {
        setCode(newCode);
      }
    });

    newSocket.on('language-update', (newLang) => {
      setLanguage(newLang);
    });

    newSocket.on('title-update', (newTitle) => {
      setRoom((prev) => ({ ...prev, roomName: newTitle }));
    });

    newSocket.on('request-info', () => {
      newSocket.emit('user-join', {
        code: code,
        language: language,
      });
    });

    newSocket.on('accept-info', (data) => {
      if (data.code) setCode(data.code);
      if (data.language) setLanguage(data.language);
    });

    setSocket(newSocket);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      wordWrap: 'on',
      automaticLayout: true,
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      formatOnType: true,
    });
  };

  const handleCodeChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    if (socket) {
      socket.emit('code-change', newCode);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (socket) {
      socket.emit('language-change', newLang);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running...\n');
    
    try {
      const response = await roomAPI.executeCode(code, language);
      if (response.success) {
        setOutput(response.output || response.error || 'Code executed successfully');
      } else {
        setOutput(response.error || 'Execution failed');
      }
    } catch (error) {
      setOutput(`Error: ${error.response?.data?.message || error.message || 'Failed to execute code'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleGetAIRecommendations = async () => {
    setAiLoading(true);
    setShowAI(true);
    
    try {
      const response = await roomAPI.getAIRecommendations(code, language);
      if (response.success) {
        setAiRecommendations(response.recommendations || []);
      } else {
        setAiRecommendations([{ type: 'error', message: response.message || 'Failed to get recommendations' }]);
      }
    } catch (error) {
      setAiRecommendations([{ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to get AI recommendations' 
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', {
        message: newMessage,
        sender: user?.username || 'User',
      });
      setNewMessage('');
    }
  };

  const handleLeaveRoom = async () => {
    if (socket) {
      socket.emit('leaving');
      socket.disconnect();
    }
    if (room?.roomCode) {
      try {
        await roomAPI.leaveRoom(room.roomCode);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
    navigate('/dashboard');
  };

  const getLanguageId = (lang) => {
    const languageMap = {
      javascript: 'javascript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
    };
    return languageMap[lang] || 'javascript';
  };

  if (loading) {
    return (
      <div className="room-container">
        <div className="loading">Loading room...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="room-container">
        <div className="error-message">{error || 'Room not found'}</div>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="room-container">
      <header className="room-header">
        <div className="room-header-left">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back
          </button>
          <h1>{room.roomName}</h1>
          <span className="room-code-badge">Code: {room.roomCode}</span>
        </div>
        <div className="room-header-right">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="language-select"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
          <button 
            onClick={handleRunCode} 
            className="run-button"
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : '▶ Run'}
          </button>
          <button 
            onClick={handleGetAIRecommendations} 
            className="ai-button"
            disabled={aiLoading}
          >
            {aiLoading ? '...' : '🤖 AI'}
          </button>
          <button onClick={handleLeaveRoom} className="leave-button">
            Leave Room
          </button>
        </div>
      </header>

      <div className="room-content">
        <div className="code-editor-section">
          <div className="code-editor-header">
            <h3>Code Editor</h3>
          </div>
          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={getLanguageId(language)}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                wordWrap: 'on',
                automaticLayout: true,
                bracketPairColorization: { enabled: true },
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                insertSpaces: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
              }}
            />
          </div>
          {output && (
            <div className="output-section">
              <div className="output-header">
                <h4>Output</h4>
                <button onClick={() => setOutput('')} className="clear-output">Clear</button>
              </div>
              <pre className="output-content">{output}</pre>
            </div>
          )}
        </div>

        <div className="right-panel">
          {showAI && (
            <div className="ai-section">
              <div className="ai-header">
                <h3>AI Recommendations</h3>
                <button onClick={() => setShowAI(false)} className="close-ai">×</button>
              </div>
              <div className="ai-content">
                {aiLoading ? (
                  <div className="ai-loading">Getting recommendations...</div>
                ) : aiRecommendations.length > 0 ? (
                  aiRecommendations.map((rec, index) => (
                    <div key={index} className={`ai-recommendation ${rec.type || 'info'}`}>
                      <div className="ai-rec-title">{rec.title || 'Recommendation'}</div>
                      <div className="ai-rec-message">{rec.message}</div>
                      {rec.code && (
                        <pre className="ai-rec-code">{rec.code}</pre>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="ai-empty">No recommendations available</div>
                )}
              </div>
            </div>
          )}

          <div className="chat-section">
            <div className="chat-header">
              <h3>Chat</h3>
            </div>
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div key={index} className="message">
                  <span className="message-sender">{msg.sender}:</span>
                  <span className="message-text">{msg.text || msg.test}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="chat-input"
              />
              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
