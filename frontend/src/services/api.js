import axios from 'axios';

const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export const api = {
  startSession: (qrCode) => axios.post(`${NEXT_PUBLIC_API_BASE}/api/start-session`, { qrCode }),
  getSession: (sessionId) => axios.get(`${NEXT_PUBLIC_API_BASE}/api/session/${sessionId}`),
  answerQuestion: (sessionId, questionId, answer) => axios.post(`${NEXT_PUBLIC_API_BASE}/api/session/${sessionId}/answer`, { questionId, answer }),
  nextStage: (sessionId) => axios.post(`${NEXT_PUBLIC_API_BASE}/api/session/${sessionId}/next-stage`),
  submitSession: (sessionId, user) => axios.post(`${NEXT_PUBLIC_API_BASE}/api/session/${sessionId}/submit`, { user }),
  getQuestions: (stage) => axios.get(`${NEXT_PUBLIC_API_BASE}/api/questions?stage=${stage}`),
};