import express from 'express';
import admin from 'firebase-admin';
import axios from 'axios';


const router = express.Router();

// Register - POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({ error: "Поля email, name, password обязательны" });
    }

    // Создаем пользователя в Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Добавляем пользователя в Firestore
    await req.db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      role: role || "student",
      createdAt: new Date(),
    });

    return res.status(201).json({ message: "Пользователь добавлен", id: userRecord.uid });
  } catch (error) {
    console.error("Ошибка добавления пользователя:", error);
    return res.status(500).json({ error: "Ошибка добавления: " + error.message });
  }
});

// Login - POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data } = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    res.cookie("token", data.idToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",   // 🔥 ВАЖНО
    });

    return res.status(200).json({
      uid: data.localId,
      email: data.email,
      token: data.idToken
    });

  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    return res.status(401).json({ error: errorMessage });
  }
});

// Get current user - GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    let { token } = req.body;

    if (!token) {
      token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        token = req.cookies.token
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: "Токен не предоставлен" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await req.db.collection("users").doc(decodedToken.uid).get();

    if (!user.exists) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    return res.status(200).json({ id: user.id, ...user.data() });
  } catch (error) {
    return res.status(401).json({ error: "Неверный токен: " + error.message });
  }
});

// Logout - POST /api/auth/logout
router.post('/logout', (req, res) => {
  // В REST API логаут обычно осуществляется удалением токена на фронте
  return res.status(200).json({ message: "Logout successful" });
});

// Change password - POST /api/auth/changepassword
router.post('/changepassword', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Токен и newPassword обязательны" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    await admin.auth().updateUser(decodedToken.uid, { password: newPassword });

    return res.status(200).json({ message: "Пароль изменен успешно" });
  } catch (error) {
    return res.status(500).json({ error: "Ошибка изменения пароля: " + error.message });
  }
});

// Verify token - POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.body.token;

    if (!token) {
      return res.status(401).json({ error: "Токен не предоставлен" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    return res.status(200).json({ valid: true, uid: decodedToken.uid });
  } catch (error) {
    return res.status(401).json({ error: "Неверный токен: " + error.message });
  }
});

export default router;
