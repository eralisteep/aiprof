import express from 'express';
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

// Group tags by categories с поддержкой объектов (value, ru, kz)
function groupTags(normalized, aiTags) {
  const groups = {
    personality: {
      title: { ru: "Личностные качества", kz: "Жеке қасиеттер" },
      core_traits: { title: { ru: "Основные черты", kz: "Негізгі қасиеттер" } },
      social_traits: { title: { ru: "Социальные черты", kz: "Әлеуметтік қасиеттер" } },
      cognitive_traits: { title: { ru: "Когнитивные черты", kz: "Когнитивтік қасиеттер" } },
    },
    interests: {
      title: { ru: "Интересы", kz: "Қызығушылықтар" }
    }
  };

  // Создаем плоскую карту для быстрого поиска метаданных тега по коду
  const tagMetadata = {};
  const rawTags = aiTags.AI_TAGS;

  for (const [cat, content] of Object.entries(rawTags)) {
    if (cat === 'personality') {
      for (const [subCat, tags] of Object.entries(content)) {
        for (const [code, info] of Object.entries(tags)) {
          tagMetadata[code] = { category: cat, subCategory: subCat, ...info };
        }
      }
    } else {
      for (const [code, info] of Object.entries(content)) {
        tagMetadata[code] = { category: cat, subCategory: null, ...info };
      }
    }
  }

  // Распределяем нормализованные значения
  for (const [tagCode, value] of Object.entries(normalized)) {
    const info = tagMetadata[tagCode];
    
    // Формируем объект тега
    const tagObject = {
      value: value,
      ru: info?.ru || tagCode,
      kz: info?.kz || tagCode
    };

    if (info) {
      if (info.category === 'personality') {
        groups.personality[info.subCategory][tagCode] = tagObject;
      } else {
        groups.interests[tagCode] = tagObject;
      }
    } else {
      // Если тега нет в базе aiTags, добавляем в интересы
      groups.interests[tagCode] = tagObject;
    }
  }

  return groups;
}

router.post('/', async (req, res) => {
  const { answers, user } = req.body || {};
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid answers' });
  }

  try {
    const questionsSnapshot = await req.db.collection('questions').get();
    const questions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const aiTagsSnapshot = await req.db.collection('aiTags').get();
    const aiTagsData = {};
    
    aiTagsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Исправлено: берем type напрямую или по условию
      const category = data.type === 'personality' ? 'personality' : 'interests';
      
      if (!aiTagsData[category]) aiTagsData[category] = {};
      
      const tagInfo = { ru: data.ru, kz: data.kz };

      if (data.subCategory) {
        if (!aiTagsData[category][data.subCategory]) aiTagsData[category][data.subCategory] = {};
        aiTagsData[category][data.subCategory][data.code] = tagInfo;
      } else {
        aiTagsData[category][data.code] = tagInfo;
      }
    });

    const aiTags = { AI_TAGS: aiTagsData };

    const profile = calculateProfile(answers, questions);
    const normalized = normalizeProfile(profile, questions);
    const groupedProfile = groupTags(normalized, aiTags);
    const matchResults = await matchDirections(normalized, req.db);
    
    const analysis = await analyzeTestResult(answers, groupedProfile, matchResults, req.body.language, questions);

    // Сохранение в БД
    const resultData = {
      answers,
      profile: groupedProfile,
      matchResults,
      analysis,
      timestamp: new Date()
    };
    if (user) resultData.user = user;
    
    await req.db.collection('results').add(resultData);

    res.json({ profile: groupedProfile, matchResults, analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;