import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import qrcode from 'qrcode';
import session from 'express-session';
import TestResult from './models/TestResult.js';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import { getQuestions, getQuestionsData } from './controllers/questionController.js';
import answersRouter from './controllers/answers.js';
import authRouter from './controllers/authRouter.js';
import getColleges from './controllers/collegesController.js';
import { adminAuthMiddleware } from './middleware/adminAuth.js';

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3001,http://localhost:3000").split(",").map(o => o.trim());
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ["set-cookie"]
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(session({
  secret: 'germany',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: "none"
  }
}));
app.use(cookieParser());


// Initialize Firebase Admin
let db;
try {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
  };
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://aiprof-1e0f2.firebaseio.com'
  });
  db = admin.firestore();
} catch (error) {
  console.error('Error initializing Firebase:', error);
  db = null; // Или использовать mock
}

// Middleware to pass db to controllers
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Controllers

app.use('/api/auth', authRouter);
app.use('/api/answers', adminAuthMiddleware, answersRouter);
// Routes
// Получение вопросов
app.get('/api/questions', adminAuthMiddleware, (req, res) => getQuestions(req, res));

app.get('/api/colleges', adminAuthMiddleware, (req, res) => getColleges(req, res));

// Получение адаптивных вопросов
// app.post('/api/get-adaptive-questions', (req, res) => getAdaptiveQuestions(req, res));

app.post('/api/result', adminAuthMiddleware, (req, res) => {
    const { answers } = req.body;
    const testRef = req.db.collection('testResults').doc();
    const testResult = new TestResult(testRef.id, 1, answers, new Date());
    testRef.set(testResult.toFirestore());
    res.json({
        message: 'Test result saved successfully',
        testId: testRef.id
    });
});


const activeSessions = new Set();
const sessionTokens = new Map(); // token -> sessionID

app.get("/connect", async (req, res) => {
  const token = req.query.token;
  if (token && sessionTokens.has(token)) {
    const sessionID = sessionTokens.get(token);
    req.session.connected = true;
    req.session.token = token;
    activeSessions.add(sessionID);
    sessionTokens.delete(token); // Удалить токен после использования

    try {
      // Получить вопросы для теста
      const questions = await getQuestionsData(db);

      console.log(questions)
      
      res.json({
        token: token,
        tests: questions // Отправить вопросы как тесты
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  } else {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});


app.get("/qr", async (req, res) => {
  try {
    const token = uuidv4();
    const sessionID = req.sessionID;
    sessionTokens.set(token, sessionID);

    const url = `https://aiprof.collegeit.edu.kz/`;
    const QRcode = await qrcode.toDataURL(url, {
      width: 600,        // размер в пикселях (главный параметр)
      margin: 2,         // отступы
      errorCorrectionLevel: "H" // лучше читается
    });
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body{
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              img{
                  text-align: center;
              }
          </style>
          <title>Document</title>
      </head>
      <body>
          <img src="${QRcode}" alt="">
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get("/qr2", async (req, res) => {
  try {
    const token = uuidv4();
    const sessionID = req.sessionID;
    sessionTokens.set(token, sessionID);

    const url = `https://careerit.vercel.app/`;
    const QRcode = await qrcode.toDataURL(url, {
      width: 600,        // размер в пикселях (главный параметр)
      margin: 2,         // отступы
      errorCorrectionLevel: "H" // лучше читается
    });
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body{
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              img{
                  text-align: center;
              }
          </style>
          <title>Document</title>
      </head>
      <body>
          <img src="${QRcode}" alt="">
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});