# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd Collabrative-IDE/server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multi-collab
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_here   # optional
```

| Variable       | Required | Default               | Description                     |
| -------------- | -------- | --------------------- | ------------------------------- |
| PORT           | No       | 5000                  | Server port                     |
| MONGODB_URI    | Yes      | —                     | MongoDB connection string       |
| JWT_SECRET     | Yes      | —                     | JWT signing secret              |
| CLIENT_URL     | No       | http://localhost:5173 | Frontend origin for CORS        |
| OPENAI_API_KEY | No       | —                     | Enables AI code recommendations |

Start the backend:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd Collabrative-IDE/client
npm install
```

(Optional) Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

### 3. Access the Application

Open your browser and go to: `http://localhost:5173`

1. Register a new account
2. Create a room or join one with a room code
3. Share the code with others and start collaborating

## Code Execution Requirements

To run code from the editor, the corresponding tool must be installed on the server machine:

| Language   | Tool Required | Install Command (example)      |
| ---------- | ------------- | ------------------------------ |
| JavaScript | Node.js       | Pre-installed with the server  |
| Python     | Python 3      | `sudo apt install python3`     |
| Java       | JDK           | `sudo apt install default-jdk` |
| C          | GCC           | `sudo apt install gcc`         |
| C++        | G++           | `sudo apt install g++`         |

## Important Notes

1. **MongoDB**: Must be running before starting the backend
2. **Ports**: Backend on 5000 (configurable), Frontend on 5173 (Vite default)
3. **CORS**: The backend reads `CLIENT_URL` from `.env` to allow cross-origin requests. If deploying to a different domain, update this variable.
4. **Cookies**: Authentication uses HTTP-only cookies — make sure your browser allows cookies
5. **AI Features**: Without `OPENAI_API_KEY`, the AI panel shows basic built-in tips instead of GPT-powered recommendations

## Troubleshooting

### Backend won't start

- Check if MongoDB is running
- Verify PORT in `.env` is not already in use
- Check if MONGODB_URI is correct
- Look at terminal output for connection errors

### Frontend can't connect to backend

- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure `VITE_API_URL` matches your backend URL
- If on different domains, set `CLIENT_URL` in backend `.env`

### Socket.io connection issues

- Make sure the backend is running
- Check browser console for WebSocket errors
- Verify `CLIENT_URL` in backend `.env` matches the frontend origin

### Authentication issues

- Clear browser cookies and try logging in again
- Check if `JWT_SECRET` is set in backend `.env`
- Verify cookies are enabled in your browser
- Try a hard refresh (Ctrl+Shift+R)

### Code execution not working

- Verify the required compiler/interpreter is installed (`node`, `python`, `gcc`, etc.)
- Check that the `server/temp/` directory exists and is writable
- Look at backend logs for execution errors
