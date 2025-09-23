import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import postsRouter from './routes/posts.router.js';
import passport from './configs/passport.js';
import authRouter from './routes/auth.router.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';

app.use(cors());

app.use(passport.initialize());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({ limit: '10mb' }));

// routes
app.use('/api/v1/posts', postsRouter);
app.use('/api/auth', authRouter);


mongoose.set('strictQuery', false);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
