import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

export const api = {
  startSession: (qrCode) => axios.post(`${API_BASE}/api/start-session`, { qrCode }),
  getSession: (sessionId) => axios.get(`${API_BASE}/api/session/${sessionId}`),
  answerQuestion: (sessionId, questionId, answer) => axios.post(`${API_BASE}/api/session/${sessionId}/answer`, { questionId, answer }),
  nextStage: (sessionId) => axios.post(`${API_BASE}/api/session/${sessionId}/next-stage`),
  submitSession: (sessionId, user) => axios.post(`${API_BASE}/api/session/${sessionId}/submit`, { user }),
  getQuestions: (stage) => axios.get(`${API_BASE}/api/questions?stage=${stage}`),
};