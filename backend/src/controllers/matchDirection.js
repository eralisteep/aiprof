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

// Для каждого направления ищем до трех лучших профессий по совпадению
async function matchDirections(userProfile, db) {
  // Load directions and professions from Firestore
  const directionsSnapshot = await db.collection('directions').get();
  const directions = directionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const professionsSnapshot = await db.collection('professions').get();
  const professions = professionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const results = directions.map(dir => {
    const profs = professions.filter(p => p.directionId === dir.id);
    // Для каждой профессии считаем score и сортируем
    const scoredProfs = profs.map(prof => ({
      id: prof.id,
      title: prof.title,
      score: Number(similarity(userProfile, prof.profile).toFixed(3))
    }));
    scoredProfs.sort((a, b) => b.score - a.score);
    const topProfs = scoredProfs.slice(0, 5);
    return {
      directionId: dir.id,
      directionTitle: dir.title,
      professions: topProfs
    };
  });
  // Сортируем направления по максимальному совпадению среди профессий
  results.sort((a, b) => {
    const maxA = a.professions.length > 0 ? a.professions[0].score : 0;
    const maxB = b.professions.length > 0 ? b.professions[0].score : 0;
    return maxB - maxA;
  });
  return results.slice(0, 2);
}

export { matchDirections, similarity };
