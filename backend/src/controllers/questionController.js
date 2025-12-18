const Question = require('../models/Question');

async function getQuestions(req, res) {
  try {
    const stage = req.query.stage || 'core';
    // const snapshot = await req.db.collection('questions').where('stage', '==', stage).where('active', '==', true).get();
    const snapshot = await req.db.collection('questions').get();
    const questions = snapshot.docs.map(doc => Question.fromFirestore(doc));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getQuestionsData(db, stage = 'core') {
  if (!db) {
    console.warn('Firestore not initialized, returning empty questions');
    return [];
  }
  try {
    const snapshot = await db.collection('questions').where('stage', '==', stage).where('active', '==', true).get();
    const questions = snapshot.docs.map(doc => Question.fromFirestore(doc));
    return questions;
  } catch (error) {
    throw error;
  }
}

async function getAdaptiveQuestions(req, res) {
  try {
    const { answers } = req.body;
    // Simple logic: calculate scores and select questions for low-scored tags
    const tagScores = {};
    for (const [qId, answer] of Object.entries(answers)) {
      const qDoc = await req.db.collection('questions').doc(qId).get();
      if (qDoc.exists) {
        const q = Question.fromFirestore(qDoc);
        q.aiTags.forEach(tag => {
          tagScores[tag] = (tagScores[tag] || 0) + answer * q.weight;
        });
      }
    }
    // Find tags with low scores (<3) and get questions for them
    const lowTags = Object.keys(tagScores).filter(tag => tagScores[tag] < 3);
    if (lowTags.length === 0) {
      return res.json([]); // No need for more questions
    }
    const adaptiveQuestions = [];
    for (const tag of lowTags) {
      const qSnapshot = await req.db.collection('questions').where('aiTags', 'array-contains', tag).where('stage', '==', 'adaptive').limit(2).get();
      qSnapshot.docs.forEach(doc => {
        adaptiveQuestions.push(Question.fromFirestore(doc));
      });
    }
    res.json(adaptiveQuestions.slice(0, 10)); // Limit to 10
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getQuestions,
  getAdaptiveQuestions,
  getQuestionsData
};