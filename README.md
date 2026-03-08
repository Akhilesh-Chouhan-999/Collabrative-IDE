# Multi-Collab IDE

A real-time collaborative code editor built with React, Node.js, Express, Socket.io, and MongoDB. Multiple users can code together in shared rooms with live synchronization, chat, code execution, and AI-powered recommendations.

## Features

### Authentication & Sessions

- User registration and login with JWT-based authentication
- HTTP-only cookie tokens for security
- Persistent sessions — stay logged in across page refreshes
- Protected routes with automatic redirects

### Dashboard

- User profile with avatar and stats (rooms created, rooms joined)
- Create new rooms with a name and language
- Join existing rooms by room code
- Room cards showing language, participants, and admin info
- Copy room code to clipboard
- Delete rooms (admin only, with confirmation)

### Collaborative Code Editor

- **Monaco Editor** (VS Code engine) with full IntelliSense
- Real-time code synchronization across all participants
- Live language switching (JavaScript, Python, Java, C, C++, HTML, CSS)
- **Typing indicators** — see who is currently editing
- **Online users panel** — see who is in the room
- Code templates — quickly load starter code for any language
- Theme toggle (dark / light)
- Adjustable font size (10–24px)
- Download code as a file with correct extension
- Copy room code to clipboard

### Code Execution

- Run code directly from the editor
- Supports **JavaScript, Python, Java, C, C++**
- Real-time output display with clear button
- 10-second execution timeout for safety
- Temporary file isolation and cleanup

### AI Recommendations

- AI-powered code analysis using OpenAI GPT-3.5-turbo
- Categorized suggestions: info, tips, warnings, errors
- Code quality, best practices, bug detection, performance
- Graceful fallback to basic tips when no API key is configured

### Real-time Chat

- In-room chat with message timestamps
- System messages for join/leave events
- Own messages highlighted
- Message count display
- Auto-scroll to latest messages

### Notifications

- Toast notifications for key events (join, leave, copy, errors)
- Leave room confirmation dialog

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

**For code execution, install the relevant compilers/interpreters:**

| Language   | Requirement | Command          |
| ---------- | ----------- | ---------------- |
| JavaScript | Node.js     | `node`           |
| Python     | Python 3    | `python`         |
| Java       | JDK         | `javac` + `java` |
| C          | GCC         | `gcc`            |
| C++        | G++         | `g++`            |

## Installation

### Backend

```bash
cd Collabrative-IDE/server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key  # optional
```

Start the server:

```bash
npm run dev
```

The server runs on `http://localhost:5000`.

### Frontend

```bash
cd Collabrative-IDE/client
npm install
```

(Optional) Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:5173` in your browser
3. Register a new account or log in
4. Create a new room or join one with a room code
5. Share the room code with collaborators
6. Code together with live sync, chat, and AI recommendations

## Project Structure

```
Collabrative-IDE/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── context/            # AuthContext (session management)
│   │   ├── pages/              # Login, Register, Dashboard, Room
│   │   ├── services/           # Axios API layer
│   │   ├── App.jsx             # Routes & auth wrappers
│   │   └── main.jsx            # Entry point
│   └── package.json
│
├── server/                     # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/        # auth, room, code controllers
│   │   ├── middleware/          # JWT auth middleware
│   │   ├── model/              # Mongoose schemas (user, room, message)
│   │   ├── routes/             # auth & room routes
│   │   ├── socket/             # Socket.io handlers (room, code, chat)
│   │   ├── lib/                # DB connection
│   │   └── index.js            # Server entry point
│   └── package.json
│
├── SETUP.md                    # Quick setup guide
├── CODE_EXECUTION_EXPLAINED.md # How code execution works
└── README.md
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description                   | Auth |
| ------ | -------------------- | ----------------------------- | ---- |
| POST   | `/api/auth/register` | Register a new user           | No   |
| POST   | `/api/auth/login`    | Login and receive JWT cookie  | No   |
| DELETE | `/api/auth/logout`   | Logout and clear cookie       | Yes  |
| GET    | `/api/auth/me`       | Check auth / get current user | Yes  |

### Rooms

| Method | Endpoint                         | Description                 | Auth |
| ------ | -------------------------------- | --------------------------- | ---- |
| GET    | `/api/room/roomsforuser`         | Get all rooms for user      | Yes  |
| POST   | `/api/room/createRoom`           | Create a new room           | Yes  |
| POST   | `/api/room/joinRoom/:roomCode`   | Join a room by code         | Yes  |
| PATCH  | `/api/room/leaveRoom/:roomCode`  | Leave a room                | Yes  |
| GET    | `/api/room/inaroom/:roomId`      | Get room details            | Yes  |
| DELETE | `/api/room/deleteRoom/:roomCode` | Delete a room (admin only)  | Yes  |
| POST   | `/api/room/execute`              | Execute code                | Yes  |
| POST   | `/api/room/ai-recommendations`   | Get AI code recommendations | Yes  |

### Messages

| Method | Endpoint                     | Description       | Auth |
| ------ | ---------------------------- | ----------------- | ---- |
| GET    | `/api/room/messages/:roomId` | Get room messages | Yes  |
| POST   | `/api/room/messages/:roomId` | Save a message    | Yes  |

## Socket Events

### Client → Server

| Event             | Payload                        | Description           |
| ----------------- | ------------------------------ | --------------------- |
| `join-room`       | `{ roomId, username }`         | Join a room           |
| `code-change`     | `{ roomId, code }`             | Send code changes     |
| `language-change` | `{ roomId, language }`         | Change language       |
| `title-change`    | `{ roomId, title }`            | Change room title     |
| `sendMessage`     | `{ room, message, sender }`    | Send chat message     |
| `typing-start`    | `{ roomId, username }`         | Notify typing started |
| `typing-stop`     | `{ roomId, username }`         | Notify typing stopped |
| `cursor-change`   | `{ roomId, cursor, username }` | Share cursor position |
| `leaving`         | `{ roomId, username }`         | Leave room            |

### Server → Client

| Event             | Payload                          | Description                |
| ----------------- | -------------------------------- | -------------------------- |
| `code-update`     | `code`                           | Receive code changes       |
| `language-update` | `language`                       | Receive language change    |
| `title-update`    | `title`                          | Receive title change       |
| `receive-message` | `{ sender, message, timestamp }` | Receive chat message       |
| `online-users`    | `[{ username, socketId }]`       | Updated online users list  |
| `user-typing`     | `{ username, isTyping }`         | Typing indicator update    |
| `cursor-update`   | `{ username, cursor }`           | Cursor position update     |
| `request-info`    | —                                | Request current room state |
| `accept-info`     | `{ code, language }`             | Receive room state         |

## Technologies

### Frontend

- **React 18** with hooks and context
- **React Router DOM** for routing
- **Monaco Editor** (@monaco-editor/react) — VS Code in the browser
- **Socket.io Client** for real-time communication
- **Axios** for HTTP requests
- **Vite** for fast development and builds

### Backend

- **Node.js** + **Express.js** REST API
- **Socket.io** for WebSocket communication
- **MongoDB** with **Mongoose** ODM
- **JWT** (jsonwebtoken) for authentication
- **bcryptjs** for password hashing
- **child_process** for code execution sandboxing
- **OpenAI API** (optional) for AI recommendations
- **uuid** for unique room codes

## Environment Variables

### Server (`server/.env`)

| Variable       | Required | Description                                            |
| -------------- | -------- | ------------------------------------------------------ |
| PORT           | No       | Server port (default: 5000)                            |
| MONGODB_URI    | Yes      | MongoDB connection string                              |
| JWT_SECRET     | Yes      | Secret key for JWT signing                             |
| CLIENT_URL     | No       | Frontend URL for CORS (default: http://localhost:5173) |
| OPENAI_API_KEY | No       | OpenAI API key for AI recommendations                  |

### Client (`client/.env`)

| Variable     | Required | Description                                  |
| ------------ | -------- | -------------------------------------------- |
| VITE_API_URL | No       | Backend URL (default: http://localhost:5000) |

## Notes

- MongoDB must be running before starting the backend
- Authentication uses HTTP-only cookies — ensure CORS credentials are enabled
- The `CLIENT_URL` env variable allows deploying frontend and backend on different domains
- Code execution runs on the server with a 10-second timeout per execution
- AI recommendations require an OpenAI API key; without it, basic tips are shown
- All socket rooms are tracked with online user counts for real-time presence

## License

ISC
