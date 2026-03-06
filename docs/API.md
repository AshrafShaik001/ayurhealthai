# 🔌 API Reference

> **Base URL (development):** `http://localhost:5001/api`
>
> **Base URL (production):** `https://your-backend.railway.app/api`

All request and response bodies use `application/json`. Protected endpoints require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

- [Authentication](#authentication)
- [Dashboard](#dashboard)
- [Dosha Quiz](#dosha-quiz)
- [Dinacharya (Daily Routine)](#dinacharya-daily-routine)
- [Symptom Checker](#symptom-checker)
- [Recommendations](#recommendations)
- [Seasonal Guide](#seasonal-guide)
- [Recipe Finder](#recipe-finder)
- [Food Compatibility](#food-compatibility)
- [Remedies](#remedies)
- [Consultation](#consultation)
- [Health Check](#health-check)
- [Error Responses](#error-responses)

---

## Authentication

### POST `/auth/signup`

Register a new user account.

**Request Body**

```json
{
  "name": "Arjun Sharma",
  "email": "arjun@example.com",
  "password": "securePassword123",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "height": 175,
  "weight": 70,
  "bodyFrame": "Medium",
  "existingDosha": "Unknown",
  "healthConditions": "Mild anxiety"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Full name |
| `email` | string | ✅ | Must be unique |
| `password` | string | ✅ | Min 6 characters (hashed with bcrypt) |
| `dateOfBirth` | string | No | ISO date format |
| `gender` | string | No | `"Male"` / `"Female"` / `"Other"` |
| `height` | number | No | In centimetres |
| `weight` | number | No | In kilograms |
| `bodyFrame` | string | No | `"Small"` / `"Medium"` / `"Large"` |
| `existingDosha` | string | No | `"Vata"` / `"Pitta"` / `"Kapha"` / `"Unknown"` |
| `healthConditions` | string | No | Free text |

**Response `201`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65f4a3b2c8d1e2f3a4b5c6d7",
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "existingDosha": "Unknown"
  }
}
```

**Errors**

| Status | Reason |
|---|---|
| `400` | Missing required fields or validation error |
| `409` | Email already registered |

---

### POST `/auth/login`

Authenticate an existing user and receive a JWT token.

**Request Body**

```json
{
  "email": "arjun@example.com",
  "password": "securePassword123"
}
```

**Response `200`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65f4a3b2c8d1e2f3a4b5c6d7",
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "existingDosha": "Vata",
    "gender": "Male",
    "height": 175,
    "weight": 70
  }
}
```

> The JWT token expires in **7 days**. Store it in `localStorage` or `sessionStorage` and include it in the `Authorization` header for all protected requests.

**Errors**

| Status | Reason |
|---|---|
| `400` | Missing email or password |
| `401` | Invalid email or password |

---

### GET `/auth/me` 🔒

Retrieve the current authenticated user's profile.

**Response `200`**

```json
{
  "user": {
    "_id": "65f4a3b2c8d1e2f3a4b5c6d7",
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "existingDosha": "Vata",
    "gender": "Male",
    "height": 175,
    "weight": 70,
    "bodyFrame": "Medium",
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "healthConditions": "Mild anxiety"
  }
}
```

---

### PATCH `/auth/profile` 🔒

Update the current user's profile information.

**Request Body** (all fields optional)

```json
{
  "name": "Arjun Kumar Sharma",
  "height": 176,
  "weight": 68,
  "existingDosha": "Vata",
  "healthConditions": "Mild anxiety, seasonal allergies"
}
```

**Response `200`**

```json
{
  "user": {
    "_id": "65f4a3b2c8d1e2f3a4b5c6d7",
    "name": "Arjun Kumar Sharma",
    "email": "arjun@example.com",
    "existingDosha": "Vata",
    "height": 176,
    "weight": 68
  }
}
```

---

## Dashboard

### GET `/dashboard` 🔒

Returns a personalised dashboard summary for the authenticated user.

**Response `200`**

```json
{
  "user": {
    "name": "Arjun Sharma",
    "existingDosha": "Vata",
    "email": "arjun@example.com"
  },
  "recentQuizResult": {
    "dominantDosha": "Vata",
    "percentages": { "vata": 52, "pitta": 30, "kapha": 18 },
    "createdAt": "2024-03-01T10:30:00.000Z"
  },
  "savedRecipesCount": 5,
  "savedSeasonalPlansCount": 2,
  "recentDinacharya": {
    "dosha": "Vata",
    "completionDate": "2024-03-06",
    "activitiesCompleted": 5,
    "totalActivities": 8
  }
}
```

---

## Dosha Quiz

### POST `/quiz/submit`

Submit quiz answers and receive an AI-powered dosha analysis.

**Request Body**

```json
{
  "answers": [
    {
      "questionId": 1,
      "questionText": "My body frame is...",
      "selectedOption": "Thin and light",
      "dosha": "vata"
    },
    {
      "questionId": 2,
      "questionText": "My skin tends to be...",
      "selectedOption": "Oily and smooth",
      "dosha": "kapha"
    }
  ]
}
```

> The quiz has 20 questions. Each answer maps to one of `"vata"`, `"pitta"`, or `"kapha"`.

**Response `200`**

```json
{
  "sessionId": "quiz_a1b2c3d4e5f6",
  "scores": { "vata": 9, "pitta": 7, "kapha": 4 },
  "percentages": { "vata": 45, "pitta": 35, "kapha": 20 },
  "dominantDosha": "Vata",
  "recommendation": {
    "summary": "Your dominant dosha is Vata. Vata governs movement and communication in the body...",
    "diet": {
      "favor": ["Warm, cooked foods", "Ghee", "Sesame oil", "Root vegetables"],
      "avoid": ["Raw vegetables", "Cold drinks", "Caffeine", "Dry foods"],
      "tips": ["Eat at regular times", "Favour warm, moist, heavy foods"]
    },
    "lifestyle": {
      "dailyRoutine": ["Wake by 6 AM", "Oil massage before bath", "Meditation"],
      "exercise": "Gentle yoga, walking, swimming — avoid intense exercise",
      "sleep": "Aim for 7-8 hours; sleep by 10 PM"
    },
    "herbs": [
      { "name": "Ashwagandha", "benefit": "Strengthens the nervous system, reduces anxiety" },
      { "name": "Brahmi", "benefit": "Calms Vata, improves memory and focus" }
    ],
    "yoga": ["Child's Pose", "Mountain Pose", "Forward Fold", "Savasana"]
  }
}
```

---

### GET `/quiz/result/:sessionId`

Retrieve a previously computed quiz result by session ID.

**URL Parameter:** `sessionId` — the ID returned from `POST /quiz/submit`

**Response `200`** — same structure as `POST /quiz/submit` response.

**Errors**

| Status | Reason |
|---|---|
| `404` | Session ID not found |

---

### PATCH `/quiz/link/:sessionId` 🔒

Link an anonymous quiz result to the authenticated user's account.

> This endpoint is called automatically after login when a user completed the quiz before signing in.

**Response `200`**

```json
{ "success": true }
```

---

## Dinacharya (Daily Routine)

### POST `/dinacharya/generate`

Generate a personalised Ayurvedic daily routine (Dinacharya) based on dosha and wake-up time.

**Request Body**

```json
{
  "dosha": "Vata",
  "wakeUpTime": "06:00"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `dosha` | string | ✅ | `"Vata"` / `"Pitta"` / `"Kapha"` |
| `wakeUpTime` | string | ✅ | 24-hour format `"HH:MM"` |

**Response `200`**

```json
{
  "sessionId": "dina_x7y8z9a0b1c2",
  "dosha": "Vata",
  "wakeUpTime": "06:00",
  "activities": [
    {
      "time": "06:00",
      "title": "Brahma Muhurta Wake-Up",
      "description": "Rise gently without an alarm if possible. Take three deep breaths before getting out of bed.",
      "category": "morning",
      "icon": "🌅",
      "duration": "5 minutes",
      "completed": false
    },
    {
      "time": "06:10",
      "title": "Tongue Scraping & Oil Pulling",
      "description": "Use a copper tongue scraper from back to front 7 times. Follow with 1 tbsp sesame oil pulling for 5 minutes.",
      "category": "morning",
      "icon": "🌿",
      "duration": "10 minutes",
      "completed": false
    }
  ],
  "aiSummary": "Your Vata-pacifying routine emphasises warmth, regularity, and grounding practices...",
  "doshaNote": "Vata types benefit most from consistent schedules and warming, nourishing activities."
}
```

---

### GET `/dinacharya/:sessionId`

Retrieve a saved Dinacharya routine.

**Response `200`** — same structure as `POST /dinacharya/generate` response.

---

### PATCH `/dinacharya/:sessionId/progress`

Mark one or more activities as completed for today.

**Request Body**

```json
{
  "activityIndex": 2,
  "completed": true
}
```

**Response `200`**

```json
{
  "success": true,
  "completedCount": 3,
  "totalCount": 8
}
```

---

### PATCH `/dinacharya/:sessionId/reset`

Reset all activities to uncompleted for a new day.

**Response `200`**

```json
{ "success": true }
```

---

### PATCH `/dinacharya/:sessionId/link` 🔒

Link an anonymous Dinacharya session to the authenticated user's account.

**Response `200`**

```json
{ "success": true }
```

---

## Symptom Checker

### POST `/symptoms/analyze`

Analyse a list of symptoms through an Ayurvedic lens using Claude AI.

**Request Body**

```json
{
  "symptoms": ["dry skin", "anxiety", "irregular digestion", "fatigue"],
  "dosha": "Vata"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `symptoms` | string[] | ✅ | List of symptoms as strings |
| `dosha` | string | No | User's known dosha (improves analysis) |

**Response `200`**

```json
{
  "analysis": {
    "rootCause": "Vata imbalance (Vata Vikara) — aggravated by irregular routine and excessive dryness",
    "affectedDoshas": ["Vata"],
    "affectedDhatus": ["Rasa", "Mamsa"],
    "immediateRemedies": [
      "Warm sesame oil self-massage (Abhyanga) daily",
      "Ashwagandha milk before bed",
      "Regular meal times — no skipping"
    ],
    "dietRecommendations": {
      "favor": ["Warm soups", "Ghee", "Dates", "Almonds"],
      "avoid": ["Raw salads", "Cold drinks", "Popcorn", "Dry crackers"]
    },
    "lifestyleChanges": [
      "Establish a consistent sleep schedule",
      "Practice gentle yoga and pranayama",
      "Reduce screen time after 8 PM"
    ],
    "warningSigns": "Consult a qualified Ayurvedic practitioner if symptoms persist beyond 2 weeks.",
    "severity": "Mild to Moderate"
  }
}
```

---

## Recommendations

### POST `/recommendations`

Get general AI wellness recommendations based on dosha and health goals.

**Request Body**

```json
{
  "dosha": "Pitta",
  "goals": ["stress reduction", "better sleep", "weight management"],
  "healthConditions": "Acidity, mild headaches"
}
```

**Response `200`**

```json
{
  "recommendations": {
    "overview": "For Pitta constitution, the key is to cool, calm and moderate...",
    "priority": ["Cooling diet", "Stress management", "Regular sleep schedule"],
    "diet": { "favor": [], "avoid": [], "tips": [] },
    "lifestyle": [],
    "herbs": [],
    "practices": []
  }
}
```

---

## Seasonal Guide

### POST `/seasonal-guide/generate` 🔒

Generate a complete Ritucharya (seasonal health regimen) guide using Claude AI.

**Request Body**

```json
{
  "season": "Vasanta",
  "dosha": "Kapha"
}
```

| Field | Valid Values |
|---|---|
| `season` | `"Vasanta"`, `"Grishma"`, `"Varsha"`, `"Sharad"`, `"Hemanta"`, `"Shishira"` |
| `dosha` | `"Vata"`, `"Pitta"`, `"Kapha"` |

> **Note:** This request calls Claude AI and may take 15-30 seconds.

**Response `200`**

```json
{
  "success": true,
  "season": "Vasanta",
  "dosha": "Kapha",
  "guide": {
    "season_name": "Vasanta",
    "ayurvedic_name": "Vasanta Ritu",
    "season_description": "Vasanta (Spring) is the season of renewal when Kapha begins to liquefy under the warming sun. Nature awakens and so does metabolic fire (Agni).",
    "dosha_impact": "Kapha dosha accumulates heavily during winter and begins to melt in spring, creating excess mucus, heaviness, and lethargy.",
    "foods_to_eat": [
      {
        "name": "Bitter greens (neem, dandelion)",
        "benefit": "Stimulates Agni and reduces Kapha accumulation",
        "emoji": "🥬",
        "taste": "Bitter",
        "quality": "Light/Dry"
      }
    ],
    "foods_to_avoid": [
      {
        "name": "Dairy (milk, cheese, yogurt)",
        "reason": "Increases Kapha and congestion in spring",
        "emoji": "🥛",
        "effect": "Leads to mucus build-up and sluggish digestion"
      }
    ],
    "herbs": [
      {
        "name": "Trikatu",
        "sanskrit": "Trikatu",
        "preparation": "1/4 tsp powder with honey before meals",
        "benefit": "Stimulates digestion and burns Kapha",
        "frequency": "Twice daily before meals"
      }
    ],
    "daily_routine": [
      {
        "time": "5:30–6:00 AM",
        "activity": "Early Rising & Dry Brushing",
        "description": "Wake before sunrise to counteract Kapha sluggishness. Perform Garshana (dry brushing) with a natural bristle brush to stimulate lymph flow.",
        "duration": "15 minutes",
        "icon": "🌅"
      }
    ],
    "special_advice": "Spring is the most important season for Kapha types. Be vigilant about lightening your diet drastically..."
  }
}
```

---

### POST `/seasonal-guide/save` 🔒

Save a generated seasonal guide to the user's account.

**Request Body**

```json
{
  "season": "Vasanta",
  "dosha": "Kapha",
  "guide": { }
}
```

> `guide` is the complete guide object returned from the generate endpoint.

**Response `200`**

```json
{
  "success": true,
  "plan": {
    "_id": "65f4a3b2c8d1e2f3a4b5c6d7",
    "userId": "65f4a3b2c8d1e2f3a4b5c6d0",
    "season": "Vasanta",
    "dosha": "Kapha",
    "guide": { },
    "updatedAt": "2024-03-06T10:30:00.000Z"
  }
}
```

> Saving the same season again **upserts** (overwrites) the previous plan for that season.

---

### GET `/seasonal-guide/saved` 🔒

Retrieve all saved seasonal plans for the authenticated user.

**Response `200`**

```json
{
  "success": true,
  "plans": [
    {
      "_id": "65f4a3b2c8d1e2f3a4b5c6d7",
      "season": "Vasanta",
      "dosha": "Kapha",
      "guide": { },
      "updatedAt": "2024-03-06T10:30:00.000Z"
    }
  ]
}
```

---

### DELETE `/seasonal-guide/saved/:id` 🔒

Delete a saved seasonal plan.

**URL Parameter:** `id` — MongoDB ObjectId of the plan

**Response `200`**

```json
{ "success": true }
```

**Errors**

| Status | Reason |
|---|---|
| `404` | Plan not found or does not belong to user |

---

## Recipe Finder

### POST `/recipes/generate` 🔒

Generate dosha-specific healing recipes using Claude AI.

**Request Body**

```json
{
  "dosha": "Vata",
  "season": "Hemanta",
  "goal": "energy",
  "mealType": "dinner"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `dosha` | string | ✅ | `"Vata"` / `"Pitta"` / `"Kapha"` |
| `season` | string | No | Ayurvedic season name |
| `goal` | string | No | e.g., `"energy"`, `"digestion"`, `"weight loss"` |
| `mealType` | string | No | `"breakfast"`, `"lunch"`, `"dinner"`, `"snack"` |

> This request calls Claude AI and may take 15-30 seconds.

**Response `200`**

```json
{
  "success": true,
  "recipes": [
    {
      "name": "Golden Turmeric Kitchari",
      "ingredients": [
        "1 cup split yellow mung dal",
        "1/2 cup basmati rice",
        "1 tsp turmeric",
        "1 tsp cumin seeds",
        "2 tbsp ghee",
        "4 cups water",
        "Rock salt to taste"
      ],
      "steps": [
        "Rinse dal and rice together until water runs clear",
        "Heat ghee in a heavy pot over medium heat",
        "Add cumin seeds and let them splutter",
        "Add turmeric and stir for 30 seconds",
        "Add dal, rice and water. Bring to boil",
        "Reduce heat, cover and simmer 25-30 minutes",
        "Season with rock salt and serve hot"
      ],
      "balances_dosha": ["Vata", "Pitta"],
      "aggravates_dosha": [],
      "best_season": "Hemanta",
      "health_benefits": "Deeply nourishing, easy to digest, supports Agni, rich in protein"
    }
  ]
}
```

---

### GET `/recipes/saved` 🔒

Retrieve all saved recipes for the authenticated user.

**Response `200`**

```json
{
  "success": true,
  "recipes": [
    {
      "_id": "65f4a3b2c8d1e2f3a4b5c6d7",
      "name": "Golden Turmeric Kitchari",
      "ingredients": [],
      "steps": [],
      "balances_dosha": ["Vata"],
      "filters": { "dosha": "Vata", "season": "Hemanta", "goal": "energy", "mealType": "dinner" },
      "createdAt": "2024-03-06T10:30:00.000Z"
    }
  ]
}
```

---

### POST `/recipes/save` 🔒

Save a recipe to the user's account.

**Request Body**

```json
{
  "name": "Golden Turmeric Kitchari",
  "ingredients": ["..."],
  "steps": ["..."],
  "balances_dosha": ["Vata"],
  "aggravates_dosha": [],
  "best_season": "Hemanta",
  "health_benefits": "...",
  "filters": {
    "dosha": "Vata",
    "season": "Hemanta",
    "goal": "energy",
    "mealType": "dinner"
  }
}
```

**Response `200`**

```json
{
  "success": true,
  "recipe": { "_id": "...", "name": "Golden Turmeric Kitchari", "..." }
}
```

---

### DELETE `/recipes/save/:id` 🔒

Remove a saved recipe.

**Response `200`**

```json
{ "success": true }
```

---

## Food Compatibility

### POST `/food-compatibility` 🔒

Check whether a combination of foods is Ayurvedically compatible for a given dosha.

**Request Body**

```json
{
  "foods": ["banana", "milk", "honey"],
  "dosha": "Pitta"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `foods` | string[] | ✅ | List of food names (2-10 items) |
| `dosha` | string | ✅ | `"Vata"` / `"Pitta"` / `"Kapha"` |

**Response `200`**

```json
{
  "compatible": false,
  "overall_score": 42,
  "summary": {
    "good": 1,
    "bad": 2,
    "neutral": 0
  },
  "pairings": [
    {
      "food1": "banana",
      "food2": "milk",
      "compatible": false,
      "reason": "Banana and milk are incompatible (Viruddha Ahara) — this combination is heavy, fermentative, and creates Ama (toxins)",
      "effect": "Digestive heaviness, skin conditions, sluggish Agni"
    },
    {
      "food1": "milk",
      "food2": "honey",
      "compatible": false,
      "reason": "Heating honey (e.g., in hot milk) creates toxic compounds according to Ayurveda",
      "effect": "Toxic reaction when honey is cooked or combined with hot substances"
    },
    {
      "food1": "banana",
      "food2": "honey",
      "compatible": true,
      "reason": "Both are sweet and nourishing for Vata, but acceptable for Pitta in moderation",
      "effect": "Mildly sweet, grounding combination"
    }
  ],
  "recommendation": "Avoid this combination. Have banana alone as a snack, and use warm (not hot) milk separately."
}
```

---

## Remedies

### GET `/remedies`

Retrieve all herbal remedies from the database.

**Response `200`**

```json
{
  "remedies": [
    {
      "_id": "65f4a3b2c8d1e2f3a4b5c6d7",
      "name": "Ashwagandha",
      "emoji": "🌿",
      "dosha": "Vata",
      "description": "Ashwagandha (Withania somnifera) is a powerful adaptogen that strengthens the nervous system...",
      "benefits": [
        "Reduces stress and anxiety",
        "Improves sleep quality",
        "Boosts immunity",
        "Enhances stamina"
      ],
      "usage": "Take 1/2 tsp powder with warm milk before bed. Can also be taken as capsules."
    }
  ]
}
```

---

### GET `/remedies/:id`

Get a single remedy by its MongoDB ObjectId.

**Response `200`** — single remedy object from the array above.

**Errors**

| Status | Reason |
|---|---|
| `404` | Remedy not found |

---

## Consultation

### POST `/consultation`

Submit a health concern for an AI-generated Ayurvedic consultation response.

**Request Body**

```json
{
  "name": "Priya Nair",
  "email": "priya@example.com",
  "age": 32,
  "concern": "I have been experiencing chronic fatigue, cold extremities, and difficulty concentrating for the past month.",
  "dosha": "Vata"
}
```

**Response `200`**

```json
{
  "success": true,
  "consultation": {
    "_id": "65f4a3b2c8d1e2f3a4b5c6d7",
    "name": "Priya Nair",
    "aiResponse": "Based on your symptoms of chronic fatigue, cold extremities, and difficulty concentrating, this appears to be a classic Vata imbalance...",
    "createdAt": "2024-03-06T10:30:00.000Z"
  }
}
```

---

## Health Check

### GET `/health`

Verify that the server is running. No authentication required.

**Response `200`**

```json
{ "status": "ok", "timestamp": "2024-03-06T10:30:00.000Z" }
```

---

## Error Responses

All error responses follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

### Standard HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | OK — Request successful |
| `201` | Created — Resource created successfully |
| `400` | Bad Request — Missing or invalid request data |
| `401` | Unauthorized — Missing or invalid JWT token |
| `404` | Not Found — Resource does not exist |
| `409` | Conflict — Resource already exists (e.g., duplicate email) |
| `429` | Too Many Requests — Anthropic API rate limit reached |
| `500` | Internal Server Error — Unexpected server-side error |
| `502` | Bad Gateway — AI response could not be parsed |
| `504` | Gateway Timeout — AI request timed out (retry) |

### Common Error Messages

| Error | Cause | Fix |
|---|---|---|
| `"Please provide a valid token"` | No or malformed Authorization header | Include `Authorization: Bearer <token>` |
| `"Token expired or invalid"` | JWT has expired (7-day TTL) or secret changed | Re-authenticate |
| `"Guide generation failed — please try again."` | AI response was truncated or unparseable | Retry the request |
| `"Too many requests. Please wait a moment and try again."` | Anthropic API rate limit | Wait 60 seconds before retrying |
| `"Request timed out. Please try again."` | AI request took > 90 seconds | Retry |
| `"API key error. Please check ANTHROPIC_API_KEY."` | Invalid or missing Anthropic key | Check `server/.env` |

---

## Authentication Example (JavaScript)

```js
// Login
const { data } = await axios.post('/api/auth/login', {
  email: 'arjun@example.com',
  password: 'securePassword123'
})
const token = data.token

// Use token in subsequent requests
const dashboard = await axios.get('/api/dashboard', {
  headers: { Authorization: `Bearer ${token}` }
})
```

Or use the built-in `api.js` Axios instance (already configured with the interceptor):

```js
import api from './api'
// Token is automatically attached to every request
const { data } = await api.get('/api/dashboard')
```
