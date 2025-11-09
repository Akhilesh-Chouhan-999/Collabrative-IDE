# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd Collabrative-IDE/server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multi-collab
JWT_SECRET=your_super_secret_jwt_key_here
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd Collabrative-IDE/client
npm install
```

(Optional) Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

### 3. Access the Application

Open your browser and go to: `http://localhost:5173`

## Important Notes

1. **MongoDB**: Make sure MongoDB is running before starting the backend server
2. **Ports**: 
   - Backend runs on port 5000 (configurable via .env)
   - Frontend runs on port 5173 (Vite default)
3. **CORS**: Backend is configured to accept requests from both localhost:5173 and localhost:3000
4. **Cookies**: Authentication uses HTTP-only cookies, so make sure your browser allows cookies

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify PORT in .env is not in use
- Check if MONGODB_URI is correct

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure VITE_API_URL matches your backend URL

### Socket.io connection issues
- Make sure backend Socket.io server is running
- Check browser console for connection errors
- Verify CORS settings in socket/index.js

### Authentication issues
- Clear browser cookies
- Check if JWT_SECRET is set in backend .env
- Verify cookies are enabled in browser

