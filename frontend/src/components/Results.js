import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Results = () => {
  const { sessionId } = useParams();
  const [user, setUser] = useState({ name: '', school: '', grade: '' });
  const [results, setResults] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`/api/session/${sessionId}/submit`, { user });
      setResults(response.data);
    } catch (error) {
      console.error('Failed to submit', error);
    }
  };

  if (!results) {
    return (
      <div>
        <h2>Введите данные</h2>
        <input placeholder="ФИО" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
        <input placeholder="Школа" value={user.school} onChange={(e) => setUser({ ...user, school: e.target.value })} />
        <input placeholder="Класс" value={user.grade} onChange={(e) => setUser({ ...user, grade: e.target.value })} />
        <button onClick={handleSubmit}>Завершить</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Ваш AI-профиль</h2>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
};

export default Results;