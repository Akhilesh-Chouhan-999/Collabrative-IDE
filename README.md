# Multi-Collab IDE

A real-time collaborative code editor built with React, Node.js, Express, Socket.io, and MongoDB.

## Features

- 🔐 User Authentication (Register/Login)
- 🏠 Dashboard to manage rooms
- 👥 Create and join coding rooms
- 💻 **Advanced Code Editor** with Monaco Editor (VS Code editor)
  - Auto-complete and IntelliSense
  - Bracket matching and auto-closing
  - Syntax highlighting
  - Code formatting
  - Multiple language support
- ▶️ **Code Execution** - Run code directly in the editor
  - Supports JavaScript, Python, Java, C, C++
  - Real-time output display
- 🤖 **AI Recommendations** - Get AI-powered code suggestions
  - Code quality improvements
  - Best practices
  - Bug detection
  - Performance optimizations
- 💬 Real-time chat functionality
- 🔄 Live code synchronization

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the server directory:
```bash
cd Collabrative-IDE/server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key_optional
```

**Note:** `OPENAI_API_KEY` is optional. If not provided, AI recommendations will show a message to configure it. Code execution works without it.

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd Collabrative-IDE/client
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Start both the backend and frontend servers
2. Open your browser and navigate to `http://localhost:5173`
3. Register a new account or login with existing credentials
4. Create a new room or join an existing room using the room code
5. Start coding collaboratively with real-time synchronization!

## Project Structure

```
Collabrative-IDE/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth)
│   │   ├── services/      # API service layer
│   │   └── App.jsx        # Main app component
│   └── package.json
│
└── server/                 # Node.js backend
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/        # MongoDB models
    │   ├── routes/        # API routes
    │   ├── socket/        # Socket.io handlers
    │   ├── middleware/    # Auth middleware
    │   └── index.js       # Server entry point
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `DELETE /api/auth/logout` - Logout user

### Rooms
- `GET /api/room/roomsforuser` - Get user's rooms (requires auth)
- `POST /api/room/createRoom` - Create a new room (requires auth)
- `POST /api/room/joinRoom/:roomCode` - Join a room (requires auth)
- `PATCH /api/room/leaveRoom/:roomCode` - Leave a room (requires auth)
- `GET /api/room/inaroom/:roomId` - Get room details (requires auth)
- `POST /api/room/execute` - Execute code (requires auth)
- `POST /api/room/ai-recommendations` - Get AI code recommendations (requires auth)

## Socket Events

### Client to Server
- `join-room` - Join a room
- `code-change` - Send code changes
- `language-change` - Change programming language
- `sendMessage` - Send chat message
- `leaving` - Leave room notification

### Server to Client
- `receive-message` - Receive chat message
- `code-update` - Receive code updates
- `language-update` - Receive language changes
- `request-info` - Request room state
- `accept-info` - Receive room state

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Socket.io Client
- Axios
- Monaco Editor (VS Code editor)
- Vite

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs
- Child Process (for code execution)
- OpenAI API (optional, for AI recommendations)

## Notes

- Make sure MongoDB is running before starting the backend
- The backend uses cookies for authentication, so CORS is configured to allow credentials
- Socket.io is configured to work with the frontend on port 5173 (Vite default)
- **Code Execution Requirements:**
  - Node.js must be installed for JavaScript execution
  - Python must be installed for Python execution
  - Java JDK must be installed for Java execution
  - GCC/G++ must be installed for C/C++ execution
- **AI Recommendations:**
  - Requires OpenAI API key in `.env` file (optional)
  - Without API key, basic recommendations are shown
  - Uses GPT-3.5-turbo model

## License

ISC

