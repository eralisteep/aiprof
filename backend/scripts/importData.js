import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// ⬇️ ВАЖНО: для ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Инициализация Firebase Admin 
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();

async function importData() {
  try {
    console.log('Starting data import...');

    const aiTagsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/aiTags.json'), 'utf8'));
    const aiTagsBatch = db.batch();
    // Assuming aiTagsData is an object, convert to array or handle accordingly
    // For now, assuming it's an object with AI_TAGS
    const categoryToType = {
      personality: 'personality',
      interests: 'interests',
    };
    const aiTagsArray = [];
    Object.entries(aiTagsData.AI_TAGS).forEach(([category, tags]) => {
      if (category === 'personality') {
        Object.entries(tags).forEach(([subCategory, subTags]) => {
          Object.entries(subTags).forEach(([key, value]) => {
            aiTagsArray.push({ code: key, ru: value.ru, kz: value.kz, type: categoryToType[category] || 'soft', subCategory });
          });
        });
      } else if (category === 'interests') {
        Object.entries(tags).forEach(([key, value]) => {
          aiTagsArray.push({ code: key, ru: value.ru, kz: value.kz, type: categoryToType[category] || 'soft', subCategory: null });
        });
      }
    });
    aiTagsArray.forEach(tag => {
      const docRef = db.collection('aiTags').doc(tag.code);
      aiTagsBatch.set(docRef, tag);
    });
    await aiTagsBatch.commit();
    console.log(`Imported ${aiTagsArray.length} aiTags`);

    // // Импорт professions
    // const professionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/professions_translated.json'), 'utf8'));
    // const professionsBatch = db.batch();
    // professionsData.forEach(prof => {
    //   const docRef = db.collection('professions').doc(prof.id);
    //   professionsBatch.set(docRef, prof);
    // });
    // await professionsBatch.commit();
    // console.log(`Imported ${professionsData.length} professions`);

    // // Импорт directions
    // const directionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/directions.json'), 'utf8'));
    // const directionsBatch = db.batch();
    // directionsData.forEach(dir => {
    //   const docRef = db.collection('directions').doc(dir.id);
    //   directionsBatch.set(docRef, dir);
    // });
    // await directionsBatch.commit();
    // console.log(`Imported ${directionsData.length} directions`);

    // // Импорт questions
    // const questionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions.json'), 'utf8'));
    // const questionsBatch = db.batch();
    // questionsData.forEach(q => {
    //   const docRef = db.collection('questions').doc(q.id);
    //   questionsBatch.set(docRef, q);
    // });
    // await questionsBatch.commit();
    // console.log(`Imported ${questionsData.length} questions`);

    // console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    admin.app().delete();
  }
}

importData();