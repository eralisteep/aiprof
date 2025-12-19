import express from 'express';
import fs from 'fs';
import path from 'path';

import { matchDirections } from './matchDirection.js';
import analyzeTestResult from './AIController.js';

const router = express.Router();

// Calculate profile from answers
function calculateProfile(answers, questions) {
  // answers: { q1: 0, q2: 2, ... }
  // For each answer, get question, get weights, sum by aiTag
  const tagScores = {};
  for (const q of questions) {
    const qid = q.id;
    if (answers[qid] == null) continue;
    const answerIdx = answers[qid];
    const option = q.options[answerIdx];
    if (!option || !option.weights) continue;
    for (const [tag, value] of Object.entries(option.weights)) {
      tagScores[tag] = (tagScores[tag] || 0) + value;
    }
  }
  return tagScores;
}

// Normalize profile: scale all values to [0, 1] (or 0-100%)
function normalizeProfile(profile, questions) {
  // Find max possible score for each tag
  // For each tag, sum max value for that tag across all questions
  const maxScores = {};
  for (const q of questions) {
    for (const opt of q.options) {
      if (!opt.weights) continue;
      for (const [tag, value] of Object.entries(opt.weights)) {
        maxScores[tag] = (maxScores[tag] || 0);
        if (value > maxScores[tag]) maxScores[tag] = value;
      }
    }
  }
  // For each tag, count how many questions contribute to it
  const tagQuestionCount = {};
  for (const q of questions) {
    for (const opt of q.options) {
      if (!opt.weights) continue;
      for (const tag of Object.keys(opt.weights)) {
        tagQuestionCount[tag] = (tagQuestionCount[tag] || 0) + 1;
      }
    }
  }
  // Calculate max possible sum for each tag
  const tagMaxSum = {};
  for (const tag of Object.keys(maxScores)) {
    tagMaxSum[tag] = maxScores[tag] * tagQuestionCount[tag];
  }
  // Normalize
  const normalized = {};
  for (const [tag, value] of Object.entries(profile)) {
    const max = tagMaxSum[tag] || 1;
    // Округляем до двух знаков после запятой
    normalized[tag] = Number((value / max).toFixed(2));
  }
  return normalized;
}

// Group tags by categories
function groupTags(normalized, aiTags) {
  const groups = {
    personality: {
      core_traits: {},
      social_traits: {},
      cognitive_traits: {}
    },
    interests: {}
  };

  // Create mapping tag -> { category, subCategory }
  const tagMap = {};
  for (const [category, subCats] of Object.entries(aiTags.AI_TAGS)) {
    if (category === 'personality') {
      for (const [subCat, tags] of Object.entries(subCats)) {
        for (const tag of Object.keys(tags)) {
          tagMap[tag] = { category, subCategory: subCat };
        }
      }
    } else if (category === 'interests') {
      for (const tag of Object.keys(subCats)) {
        tagMap[tag] = { category, subCategory: null };
      }
    }
  }

  // Group the normalized values
  for (const [tag, value] of Object.entries(normalized)) {
    const mapping = tagMap[tag];
    if (mapping) {
      if (mapping.category === 'personality') {
        groups.personality[mapping.subCategory][tag] = value;
      } else if (mapping.category === 'interests') {
        groups.interests[tag] = value;
      }
    } else {
      // If tag not found, add to interests by default
      groups.interests[tag] = value;
    }
  }

  return groups;
}

// POST /api/answers
router.post('/', async (req, res) => {
  const { answers, user } = req.body || {};
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid answers' });
  }

  try {
    // Load questions from Firestore
    const questionsSnapshot = await req.db.collection('questions').get();
    const questions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Load aiTags from Firestore
    const aiTagsSnapshot = await req.db.collection('aiTags').get();
    const aiTagsData = {};
    aiTagsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.type === 'soft' ? 'personality' : 'interests';
      if (!aiTagsData[category]) aiTagsData[category] = {};
      if (data.subCategory) {
        if (!aiTagsData[category][data.subCategory]) aiTagsData[category][data.subCategory] = {};
        aiTagsData[category][data.subCategory][data.code] = { ru: data.ru, kz: data.kz };
      } else {
        aiTagsData[category][data.code] = { ru: data.ru, kz: data.kz };
      }
    });
    const aiTags = { AI_TAGS: aiTagsData };

    const profile = calculateProfile(answers, questions);
    const normalized = normalizeProfile(profile, questions);
    const groupedProfile = groupTags(normalized, aiTags);
    const matchResults = await matchDirections(normalized, req.db);

    // Save to results collection
    user?
    await req.db.collection('results').add({
      user,
      answers,
      profile: groupedProfile,
      matchResults,
      timestamp: new Date()
    })
    : 
    await req.db.collection('results').add({
      answers,
      profile: groupedProfile,
      matchResults,
      timestamp: new Date()
    });

    const analysis = await analyzeTestResult(answers, groupedProfile, matchResults, req.body.language, questions)

    res.json({ profile: groupedProfile, matchResults, analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
  

export default router;
