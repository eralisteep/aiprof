import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Test = () => {
  const { sessionId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [stage, setStage] = useState('core');
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestions();
  }, [stage]);

  const API_BASE = process.env.API_BASE || "http://localhost:3000";

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/questions?stage=${stage}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to load questions', error);
    }
  };

  const handleAnswer = async (answer) => {
    const questionId = questions[currentQuestion].id;

    // Submit answer
    await axios.post(`${API_BASE}/api/session/${sessionId}/answer`, { questionId, answer });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      if (stage === 'core') {
        // Go to adaptive
        const response = await axios.post(`${API_BASE}/api/session/${sessionId}/next-stage`);
        setStage('adaptive');
        setCurrentQuestion(0);
        setQuestions(response.data.questions);
      } else {
        // Submit test
        navigate(`/results/${sessionId}`);
      }
    }
  };

  if (questions.length === 0) return <div>Загрузка...</div>;

  const question = questions[currentQuestion];

  return (
    <div>
      <h2>Вопрос {currentQuestion + 1} из {questions.length}</h2>
      <p>{question.text}</p>
      {question.type === 'scale' && (
        <div>
          {[1, 2, 3, 4, 5].map(num => (
            <button key={num} onClick={() => handleAnswer(num)}>{num}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Test;