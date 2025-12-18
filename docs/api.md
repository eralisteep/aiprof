# API Endpoints Documentation

## Overview
The AIProf backend provides RESTful API endpoints for managing questions, processing test results, and generating AI profiles. All endpoints return JSON responses.

## Base URL
`http://localhost:3000/api` (for development)

## Endpoints

### 1. Get Questions
**GET** `/questions?stage=core`

Retrieves questions for a specific stage. Use `stage=core` for initial questions, `stage=adaptive` for follow-up.

**Query Parameters:**
- `stage` (optional): "core" or "adaptive" (default: "core")

**Response:**
```json
[
  {
    "id": "Q_IT_01",
    "text": "Мне интересно разбираться, как устроены программы и сайты",
    "type": "scale",
    "aiTags": ["programming", "logic"],
    "weight": 1,
    "stage": "core",
    "active": true
  }
]
```

### 2. Get Adaptive Questions
**POST** `/get-adaptive-questions`

Analyzes initial answers and generates follow-up questions to clarify interests/abilities.

**Request Body:**
```json
{
  "answers": {
    "Q_IT_01": 4,
    "Q_IT_02": 5
  }
}
```

**Response:**
```json
[
  {
    "id": "Q_ADAPT_01",
    "text": "Generated question based on analysis",
    "type": "scale",
    "aiTags": ["creativity"],
    "weight": 1,
    "stage": "adaptive",
    "active": true
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

### 2. Submit Test Results
**POST** `/submit-test`

Submits user answers, processes them to generate AI profile and recommended professions.

**Request Body:**
```json
{
  "user": {
    "name": "Иван Иванов",
    "school": "Школа №1",
    "grade": "11"
  },
  "answers": {
    "Q_IT_01": 4,
    "Q_IT_02": 5
  }
}
```

**Response:**
```json
{
  "userId": "generated-user-id",
  "aiProfile": {
    "interests": {"programming": 4.5, "design": 3.2},
    "abilities": {"logic": 4.0, "analysis": 3.8},
    "personality": {"teamwork": 4.1, "communication": 3.9},
    "motivation": {"selfDevelopment": 4.2, "persistence": 4.0}
  },
  "recommendedProfessions": ["p1", "p2", "p3", "p4", "p5"]
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 500: Server error

### 3. Get Professions
**GET** `/professions`

Retrieves all professions with their AI profiles.

**Response:**
```json
[
  {
    "id": "p1",
    "name": "Программист",
    "college": "IT College",
    "aiProfile": {
      "it_interest": 5,
      "technical_thinking": 4
    }
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

### 4. Get AI Tags
**GET** `/aiTags`

Retrieves all AI tags for reference.

**Response:**
```json
[
  {
    "code": "programming",
    "name": "Programming",
    "ru": "Программирование",
    "type": "skill",
    "professions": ["backend_dev", "mobile_dev"]
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

### 5. Get User Profile (Future)
**GET** `/users/{userId}`

Retrieves a user's AI profile and test results.

**Response:**
```json
{
  "id": "user-id",
  "name": "Иван Иванов",
  "school": "Школа №1",
  "grade": "11",
  "aiProfile": {...},
  "testResults": {...}
}
```

**Status Codes:**
- 200: Success
- 404: User not found
- 500: Server error

## Authentication
No authentication required (anonymous access).

## Error Handling
All errors return a JSON object:
```json
{
  "error": "Error message"
}
```

## Rate Limiting
Not implemented yet. Consider adding for production.

### 6. Get Adaptive Questions
**POST** `/get-adaptive-questions`

Analyzes initial answers and generates follow-up questions to clarify interests/abilities.

**Request Body:**
```json
{
  "answers": {
    "Q_IT_01": 4,
    "Q_IT_02": 5
  }
}
```

**Response:**
```json
[
  {
    "id": "Q_ADAPT_01",
    "text": "Generated question based on analysis",
    "type": "scale",
    "aiTags": ["creativity"],
    "weight": 1,
    "stage": "adaptive",
    "active": true
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error