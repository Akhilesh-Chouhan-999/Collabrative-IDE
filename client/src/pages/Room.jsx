import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { roomAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Room.css";

const CODE_TEMPLATES = {
  javascript: `// JavaScript Starter\nconsole.log("Hello, World!");\n`,
  python: `# Python Starter\nprint("Hello, World!")\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n`,
  css: `/* CSS Starter */\nbody {\n    font-family: sans-serif;\n    margin: 0;\n    padding: 20px;\n    background: #f0f0f0;\n}\n`,
};

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core state
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Socket
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  // Chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Editor
  const editorRef = useRef(null);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);

  // Output
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // AI
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Online users & typing
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  // UI state
  const [showParticipants, setShowParticipants] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [notification, setNotification] = useState(null);

  // Code ref for socket handlers (prevents stale closure)
  const codeRef = useRef(code);
  const languageRef = useRef(language);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Set browser tab title
  useEffect(() => {
    if (room) {
      document.title = `${room.roomName} - Multi-Collab IDE`;
    }
    return () => {
      document.title = "Multi-Collab IDE";
    };
  }, [room]);

  // Toast notification helper
  const showNotification = useCallback((msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Initialize room — disconnect any prior socket first to prevent StrictMode doubles
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Disconnect previous socket if it exists (StrictMode re-mount)
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setMessages([]);

      try {
        const response = await roomAPI.getRoomById(roomId);
        if (cancelled) return;
        if (response.success) {
          setRoom(response.room);
          setLanguage(response.room.language);
          setCode(
            response.room.code || CODE_TEMPLATES[response.room.language] || "",
          );
          initializeSocket(response.room);
        } else {
          setError("Room not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load room");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeSocket = (roomData) => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const newSocket = io(SOCKET_URL, { withCredentials: true });

    newSocket.on("connect", () => {
      newSocket.emit("join-room", {
        id: roomData._id,
        nameOfUser: user?.username || "User",
      });
    });

    newSocket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    newSocket.on("language-update", (newLang) => {
      setLanguage(newLang);
    });

    newSocket.on("title-update", (newTitle) => {
      setRoom((prev) => (prev ? { ...prev, roomName: newTitle } : prev));
    });

    newSocket.on("request-info", () => {
      newSocket.emit("user-join", {
        code: codeRef.current,
        language: languageRef.current,
      });
    });

    newSocket.on("accept-info", (data) => {
      if (data.code) setCode(data.code);
      if (data.language) setLanguage(data.language);
    });

    newSocket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("user-typing", ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username];
        }
        return prev.filter((u) => u !== username);
      });
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (value) => {
    const newCode = value || "";
    setCode(newCode);
    if (socket) {
      socket.emit("code-change", newCode);

      // Typing indicator
      socket.emit("typing-start");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing-stop");
      }, 1000);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (socket) {
      socket.emit("language-change", newLang);
    }
  };

  const handleLoadTemplate = () => {
    const template = CODE_TEMPLATES[language] || "";
    setCode(template);
    if (socket) {
      socket.emit("code-change", template);
    }
    showNotification("Template loaded");
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running...\n");
    try {
      const response = await roomAPI.executeCode(code, language);
      if (response.success) {
        setOutput(response.output || "Code executed successfully (no output)");
      } else {
        setOutput(response.error || "Execution failed");
      }
    } catch (err) {
      setOutput(
        `Error: ${err.response?.data?.message || err.message || "Failed to execute code"}`,
      );
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
        setAiRecommendations([
          {
            type: "error",
            message: response.message || "Failed to get recommendations",
          },
        ]);
      }
    } catch (err) {
      setAiRecommendations([
        {
          type: "error",
          message:
            err.response?.data?.message || "Failed to get AI recommendations",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit("sendMessage", {
        message: newMessage,
        sender: user?.username || "User",
      });
      setNewMessage("");
    }
  };

  const handleCopyRoomCode = async () => {
    if (room?.roomCode) {
      try {
        await navigator.clipboard.writeText(room.roomCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        showNotification("Failed to copy", "error");
      }
    }
  };

  const handleDownloadCode = () => {
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      html: "html",
      css: "css",
    };
    const ext = extensions[language] || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${room?.roomName || "code"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Code downloaded");
  };

  const handleLeaveRoom = async () => {
    if (socket) {
      socket.emit("leaving");
      socket.disconnect();
    }
    if (room?.roomCode) {
      try {
        await roomAPI.leaveRoom(room.roomCode);
      } catch (err) {
        console.error("Error leaving room:", err);
      }
    }
    navigate("/dashboard");
  };

  const toggleTheme = () => {
    setEditorTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
  };

  const getLanguageId = (lang) => {
    const languageMap = {
      javascript: "javascript",
      python: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      html: "html",
      css: "css",
    };
    return languageMap[lang] || "javascript";
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="room-container">
        <div className="loading">
          <div className="loading-spinner" />
          <p>Loading room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="room-container">
        <div className="room-error">
          <h2>Oops!</h2>
          <p>{error || "Room not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`room-container ${editorTheme === "light" ? "light-theme" : ""}`}
    >
      {/* Notification Toast */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.msg}
        </div>
      )}

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowLeaveConfirm(false)}
        >
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Leave Room?</h3>
            <p>Are you sure you want to leave this collaborative session?</p>
            <div className="confirm-actions">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button onClick={handleLeaveRoom} className="btn-confirm-leave">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="room-header">
        <div className="room-header-left">
          <button
            onClick={() => navigate("/dashboard")}
            className="back-button"
            title="Back to Dashboard"
          >
            ←
          </button>
          <div className="room-info">
            <h1>{room.roomName}</h1>
            <button
              className="room-code-badge"
              onClick={handleCopyRoomCode}
              title="Click to copy room code"
            >
              {copySuccess ? "✓ Copied!" : `Code: ${room.roomCode}`}
            </button>
          </div>
          <button
            className="participants-toggle"
            onClick={() => setShowParticipants(!showParticipants)}
            title="Online users"
          >
            <span className="online-dot" />
            {onlineUsers.length} online
          </button>
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
            onClick={handleLoadTemplate}
            className="template-button"
            title="Load starter template"
          >
            📄
          </button>
          <div className="font-size-control">
            <button
              onClick={() => setFontSize((s) => Math.max(10, s - 1))}
              title="Decrease font size"
            >
              A-
            </button>
            <span>{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(24, s + 1))}
              title="Increase font size"
            >
              A+
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title="Toggle theme"
          >
            {editorTheme === "vs-dark" ? "☀️" : "🌙"}
          </button>
          <button
            onClick={handleRunCode}
            className="run-button"
            disabled={isRunning}
          >
            {isRunning ? "⏳" : "▶"} {isRunning ? "Running..." : "Run"}
          </button>
          <button
            onClick={handleGetAIRecommendations}
            className="ai-button"
            disabled={aiLoading}
          >
            🤖 {aiLoading ? "..." : "AI"}
          </button>
          <button
            onClick={handleDownloadCode}
            className="download-button"
            title="Download code"
          >
            ⬇️
          </button>
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="leave-button"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Online Users Panel */}
      {showParticipants && (
        <div className="participants-panel">
          <div className="participants-header">
            <h3>Online Users ({onlineUsers.length})</h3>
            <button onClick={() => setShowParticipants(false)}>×</button>
          </div>
          <ul className="participants-list">
            {onlineUsers.map((u, i) => (
              <li key={i} className="participant-item">
                <span className="online-dot" />
                <span>{u.username}</span>
                {u.username === user?.username && (
                  <span className="you-tag">(You)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="room-content">
        {/* Code Editor Section */}
        <div className="code-editor-section">
          <div className="code-editor-header">
            <h3>Code Editor</h3>
            {typingUsers.length > 0 && (
              <span className="typing-indicator">
                {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </span>
            )}
          </div>
          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={getLanguageId(language)}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              theme={editorTheme}
              options={{
                fontSize,
                minimap: { enabled: true },
                wordWrap: "on",
                automaticLayout: true,
                bracketPairColorization: { enabled: true },
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                insertSpaces: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on",
                renderLineHighlight: "all",
              }}
            />
          </div>
          {output && (
            <div className="output-section">
              <div className="output-header">
                <h4>Output</h4>
                <button onClick={() => setOutput("")} className="clear-output">
                  Clear
                </button>
              </div>
              <pre className="output-content">{output}</pre>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {showAI && (
            <div className="ai-section">
              <div className="ai-header">
                <h3>AI Recommendations</h3>
                <button onClick={() => setShowAI(false)} className="close-ai">
                  ×
                </button>
              </div>
              <div className="ai-content">
                {aiLoading ? (
                  <div className="ai-loading">
                    <div className="loading-spinner small" />
                    Getting recommendations...
                  </div>
                ) : aiRecommendations.length > 0 ? (
                  aiRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`ai-recommendation ${rec.type || "info"}`}
                    >
                      <div className="ai-rec-badge">{rec.type || "info"}</div>
                      <div className="ai-rec-title">
                        {rec.title || "Recommendation"}
                      </div>
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
              <span className="chat-count">{messages.length} messages</span>
            </div>
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="chat-empty">No messages yet. Say hello!</div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender === "System" ? "system-message" : ""} ${msg.sender === user?.username ? "own-message" : ""}`}
                  >
                    <div className="message-header">
                      <span className="message-sender">{msg.sender}</span>
                      {msg.timestamp && (
                        <span className="message-time">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      )}
                    </div>
                    <span className="message-text">{msg.text}</span>
                  </div>
                ))
              )}
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
              <button
                type="submit"
                className="send-button"
                disabled={!newMessage.trim()}
              >
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
