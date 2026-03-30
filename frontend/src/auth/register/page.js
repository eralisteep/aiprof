"use client";
import { useState } from "react";
import { useAuth } from "../../context/authContext"; // Импортируем контекст
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

export default function Register() {
  const { register, registerError } = useAuth(); // Используем функцию регистрации из контекста
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password, role });
      router.push("/dashboard"); // Перенаправление после успешной регистрации
    } catch (error) {
      // Error handled by registerError
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerBox}>
        <h2 className={styles.title}>Регистрация</h2>
        {registerError && <p className={styles.error}>{registerError.message}</p>}
        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Имя</label>
            <input type="text" placeholder="Введите ваше имя" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" placeholder="Введите ваш email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Пароль</label>
            <input type="password" placeholder="Введите ваш пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {/* Выбор роли */}
          <div className={styles.inputGroup}>
            <label>Роль</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Студент</option>
              {/* Если добавлять выбор то надо изминить api\auth\register */}
              {/* 
              <option value="teacher">Преподаватель</option>
              <option value="admin">Администратор</option>
              */}
            </select>
          </div>
          <button type="submit" className={styles.button}>Зарегистрироваться</button>
        </form>
        <p className={styles.footerText}>
          Уже есть аккаунт? <a href="/auth/login">Войти</a>
        </p>
      </div>
    </div>
  );
}