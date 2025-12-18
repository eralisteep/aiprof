const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const qrcode = require('qrcode');
const session = require('express-session');
const TestResult = require('./models/TestResult');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'your-secret-key', // Замените на безопасный секрет
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Для разработки; в продакшене true с HTTPS
}));

// Initialize Firebase Admin
let db;
try {
  const serviceAccount = require('./serviceAccountKey.json');
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
const { getQuestions, getAdaptiveQuestions, getQuestionsData } = require('./controllers/questionController');

const router = require('./controllers/answers.js');
app.use('/api/answers', router);
// Routes
// Получение вопросов
app.get('/api/questions', (req, res) => getQuestions(req, res));

// Получение адаптивных вопросов
app.post('/api/get-adaptive-questions', (req, res) => getAdaptiveQuestions(req, res));

app.post('/api/result', (req, res) => {
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

    const url = `http://192.168.20.206:8080/connect?token=${token}`;
    const QRcode = await qrcode.toDataURL(url, {
      width: 600,        // размер в пикселях (главный параметр)
      margin: 2,         // отступы
      errorCorrectionLevel: "H" // лучше читается
    });
    res.render("qr.hbs", {
      title: "QR Code",
      qrcode: QRcode
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});