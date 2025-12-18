# AIProf Project Architecture

## Overview
This project implements an AI-powered career guidance mobile application for college students. The system uses adaptive testing to match students with suitable professions based on their interests, abilities, personality, and motivation.

## Architecture Components

### Frontend (Flutter)
- **Platform**: Cross-platform mobile app (Android/iOS)
- **Key Features**:
  - QR code scanning for quick access
  - Adaptive testing interface
  - Results display with AI-generated profiles
- **Structure**:
  - `lib/`: Main application code
  - `lib/screens/`: UI screens
  - `lib/models/`: Data models
  - `lib/services/`: API communication and business logic

### Backend (Node.js + Express)
- **Platform**: RESTful API server
- **Key Features**:
  - Question management
  - Test result processing
  - AI profile generation
  - Data analytics
- **Structure**:
  - `src/`: Server code
  - `tests/`: Unit and integration tests
  - `data/`: Static data files (questions, professions, AI tags)

### Database (Firebase Firestore)
- **Purpose**: NoSQL database for user data, test results, and analytics
- **Collections**:
  - Users
  - TestResults
  - Professions
  - Questions

### AI Integration
- **Technologies**: OpenAI API for LLM interpretation
- **Features**:
  - aiTag vectorization
  - Weighted profession matching
  - Result interpretation

## Data Flow
1. Student scans QR code → Frontend
2. Frontend loads questions from Backend
3. Student answers questions → Frontend
4. Answers sent to Backend for processing
5. Backend uses AI to generate profile and match professions
6. Results stored in Firestore and returned to Frontend

## Deployment
- Frontend: App stores (Google Play, App Store)
- Backend: Cloud platform (Heroku, AWS, etc.)
- Database: Firebase (managed)

## Security
- No user authentication (anonymous access)
- Data encryption in transit
- Firebase security rules for data access