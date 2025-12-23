import fs from 'fs';
import path from 'path';

// Сравнение профиля пользователя с профилем профессии (косинусное сходство)
function similarity(userProfile, profProfile) {
  let dot = 0, userNorm = 0, profNorm = 0;
  for (const tag of Object.keys(profProfile)) {
    const u = userProfile[tag] || 0;
    const p = profProfile[tag] || 0;
    dot += u * p;
    userNorm += u * u;
    profNorm += p * p;
  }
  if (userNorm === 0 || profNorm === 0) return 0;
  
  
  return dot / (Math.sqrt(userNorm) * Math.sqrt(profNorm));
}

async function matchDirections(userProfile, db) {
  // Загружаем направления
  const directionsSnapshot = await db.collection('directions').get();
  const directions = directionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Загружаем профессии
  const professionsSnapshot = await db.collection('professions').get();
  const professions = professionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Загружаем колледжи
  const collegesSnapshot = await db.collection('colleges').get();
  const colleges = collegesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Быстрый словарь для колледжей
  const collegeMap = {};
  colleges.forEach(col => {
    collegeMap[col.id] = col;
  });

  const results = directions.map(dir => {
    const profs = professions.filter(p => p.directionId === dir.id);

    const scoredProfs = profs.map(prof => {
      // collegesIds например: ["almaty-1", "astana-3"]
      const relatedColleges = (prof.collegeIds || [])
        .map(cid => collegeMap[cid])
        .filter(Boolean);

      return {
        id: prof.id,
        title: prof.title,
        score: Number(similarity(userProfile, prof.profile).toFixed(3)),
        colleges: relatedColleges   // ← ДОБАВИЛИ СЮДА
      };
    });

    scoredProfs.sort((a, b) => b.score - a.score);

    return {
      directionId: dir.id,
      directionTitle: dir.title,
      professions: scoredProfs.slice(0, 5)
    };
  });

  // Сортировка направлений по максимальному совпадению
  results.sort((a, b) => {
    const maxA = a.professions.length ? a.professions[0].score : 0;
    const maxB = b.professions.length ? b.professions[0].score : 0;
    return maxB - maxA;
  });

  return results.slice(0, 2);
}

export { matchDirections, similarity };
