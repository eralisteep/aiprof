import admin from 'firebase-admin';

// Middleware для проверки аутентификации и роли администратора
export async function adminAuthMiddleware(req, res, next) {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Токен не предоставлен" });
    }

    // Проверяем токен
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Получаем данные пользователя из Firestore
    const userDoc = await req.db.collection("users").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const user = userDoc.data();

    // Проверяем роль администратора
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Доступ запрещен: требуется роль администратора" });
    }

    // Сохраняем информацию пользователя в request
    req.user = {
      uid: decodedToken.uid,
      ...user
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Неверный токен: " + error.message });
  }
}

// Middleware для проверки аутентификации (без проверки роли)
export async function authMiddleware(req, res, next) {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Токен не предоставлен" });
    }

    // Проверяем токен
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Получаем данные пользователя из Firestore
    const userDoc = await req.db.collection("users").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const user = userDoc.data();

    // Сохраняем информацию пользователя в request
    req.user = {
      uid: decodedToken.uid,
      ...user
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Неверный токен: " + error.message });
  }
}
