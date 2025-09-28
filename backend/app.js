import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import postsRouter from './routes/posts.router.js';
import messagesRouter from './routes/messages.router.js';
import gameRouter from './routes/game.router.js';
import passport from './configs/passport.js';
import authRouter from './routes/auth.router.js';
import notFoundHandler from './middleware/notFound.js';
import authenticate from './middleware/authenticate.js';
import { initializeSocket } from './services/socket.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(passport.initialize());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'prod' }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({ limit: '10mb' }));
app.use(authenticate);

// Initialize Socket.IO
initializeSocket(io);

// Make io available to routes
app.set('io', io);

// routes
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/game', gameRouter);
app.use('/api/auth', authRouter);

// 404 handler
app.use(notFoundHandler);

mongoose.set('strictQuery', false);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('WebSocket server initialized');
});
