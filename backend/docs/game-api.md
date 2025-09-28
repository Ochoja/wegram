# Game API Documentation

## Overview
The Game API provides secure endpoints for the runner game with built-in anti-cheat measures, rate limiting, and reward system integration.

## Authentication
All endpoints require JWT authentication via:
- **Bearer token**: `Authorization: Bearer <jwt_token>`
- **Cookie**: JWT token set automatically after OAuth

## Rate Limits
- **Start Run**: 10 requests per minute per user
- **Finish Run**: 20 requests per minute per user  
- **Claim Reward**: 5 requests per minute per user
- **Leaderboard**: 30 requests per minute per IP
- **Player Stats**: 60 requests per minute per user

## Endpoints

### POST /api/v1/game/run/start
**Summary:** Start a new game run  
**Authentication:** Required (JWT token)  
**Rate Limit:** 10 requests/minute per user

**Description:** Initiates a new game session with server-side validation and anti-cheat measures.

**Request Body:**
```json
{
  "gameType": "runner",
  "clientNonce": "optional_client_generated_nonce",
  "clientData": {
    "userAgent": "Mozilla/5.0...",
    "screenResolution": "1920x1080",
    "timezone": "America/New_York"
  }
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Game run started successfully",
  "data": {
    "runId": "550e8400-e29b-41d4-a716-446655440000",
    "serverNonce": "a1b2c3d4e5f6...",
    "startTime": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Active game run exists
- `429`: Rate limit exceeded

---

### POST /api/v1/game/run/finish
**Summary:** Complete a game run and validate results  
**Authentication:** Required (JWT token)  
**Rate Limit:** 20 requests/minute per user

**Description:** Validates game completion with anti-cheat checks and determines reward eligibility.

**Request Body:**
```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "duration": 45000,
  "score": 1250,
  "distance": 500,
  "coinsCollected": 25,
  "powerUpsUsed": 3,
  "clientNonce": "optional_matching_nonce"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Game run completed",
  "data": {
    "runId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "score": 1250,
    "distance": 500,
    "duration": 45000,
    "isEligibleForReward": true,
    "rewardAmount": 35
  }
}
```

**Invalid Run Response (200):**
```json
{
  "status": 200,
  "message": "Game run completed",
  "data": {
    "runId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "invalid",
    "score": 1250,
    "distance": 500,
    "duration": 45000,
    "isEligibleForReward": false,
    "rewardAmount": 0,
    "violations": [
      "Impossible speed detected",
      "Score inconsistent with gameplay"
    ]
  }
}
```

**Anti-Cheat Validation Rules:**
- **Duration**: 1 second minimum, 10 minutes maximum
- **Speed**: Maximum 50 units per second
- **Score Consistency**: Score must align with distance and coins collected
- **Time Sync**: Client duration must match server time within 5 seconds
- **Nonce Validation**: Client nonce must match if provided during start

**Error Responses:**
- `400`: Missing required fields or invalid nonce
- `404`: Active game run not found
- `429`: Rate limit exceeded

---

### POST /api/v1/game/reward/claim
**Summary:** Claim rewards for completed game run  
**Authentication:** Required (JWT token)  
**Rate Limit:** 5 requests/minute per user

**Description:** Claims and processes rewards for eligible game runs with ledger entry.

**Request Body:**
```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Reward claimed successfully",
  "data": {
    "rewardId": "65a1b2c3d4e5f6789012345",
    "amount": 35,
    "rewardType": "tokens",
    "status": "completed",
    "claimedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

**Reward Calculation:**
- **Score-based**: 10 tokens (≥1000), 25 tokens (≥5000), 50 tokens (≥10000)
- **Distance-based**: 5 tokens (≥100), 15 tokens (≥500), 30 tokens (≥1000)
- **Clean Play Bonus**: 20% bonus for runs with no violations
- **Maximum**: 100 tokens per run

**Error Responses:**
- `400`: Run ID required or reward already claimed
- `404`: Eligible game run not found
- `429`: Rate limit exceeded

---

### GET /api/v1/game/leaderboard
**Summary:** Get game leaderboard  
**Authentication:** Required (JWT token)  
**Rate Limit:** 30 requests/minute per IP

**Description:** Retrieves ranked player statistics with filtering options.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (max: 50, default: 10)
- `timeframe` (optional): `all`, `daily`, `weekly`, `monthly` (default: all)

**Response (200):**
```json
{
  "status": 200,
  "message": "Leaderboard fetched successfully",
  "data": {
    "leaderboard": [
      {
        "userId": "65a1b2c3d4e5f6789012345",
        "username": "PlayerOne",
        "handle": "player1",
        "avatar": "https://example.com/avatar1.jpg",
        "bestScore": 15000,
        "totalDistance": 2500,
        "totalRuns": 25,
        "totalRewards": 450
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 150,
    "timeframe": "all"
  }
}
```

---

### GET /api/v1/game/me
**Summary:** Get current player statistics  
**Authentication:** Required (JWT token)  
**Rate Limit:** 60 requests/minute per user

**Description:** Retrieves comprehensive statistics for the authenticated player.

**Response (200):**
```json
{
  "status": 200,
  "message": "Player stats fetched successfully",
  "data": {
    "totalRuns": 25,
    "bestScore": 15000,
    "totalDistance": 2500,
    "totalCoins": 125,
    "averageScore": 8500,
    "totalPlayTime": 1125000,
    "totalRewards": 450,
    "totalClaims": 18,
    "currentRank": 5,
    "recentRuns": [
      {
        "runId": "550e8400-e29b-41d4-a716-446655440000",
        "score": 15000,
        "distance": 750,
        "duration": 65000,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "status": "completed",
        "isEligibleForReward": true,
        "rewardAmount": 75
      }
    ]
  }
}
```

## Security Features

### Anti-Cheat Measures
1. **Server-side Validation**: All game results validated against realistic constraints
2. **Nonce System**: Optional client/server nonce matching for session integrity
3. **Time Synchronization**: Server tracks actual play time vs reported time
4. **Speed Limits**: Maximum movement speed enforcement
5. **Score Consistency**: Score validation against gameplay metrics
6. **Suspicious Activity Tracking**: Violation counters for pattern detection

### Rate Limiting
- Per-user limits for game actions
- Per-IP limits for public endpoints
- Sliding window implementation
- Automatic cleanup of old entries

### Data Validation
- Input sanitization for all user data
- MongoDB injection prevention
- Type validation for all numeric fields
- Required field validation

## Error Codes
- **200**: Success
- **201**: Created successfully  
- **400**: Bad request (validation failed)
- **401**: Unauthorized (missing/invalid token)
- **404**: Resource not found
- **429**: Rate limit exceeded
- **500**: Internal server error

## Integration Notes

### Frontend Integration
```javascript
// Start a game run
const startResponse = await fetch('/api/v1/game/run/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    gameType: 'runner',
    clientNonce: generateNonce(),
    clientData: {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  })
});

// Finish a game run
const finishResponse = await fetch('/api/v1/game/run/finish', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    runId: gameData.runId,
    duration: gameData.duration,
    score: gameData.score,
    distance: gameData.distance,
    coinsCollected: gameData.coins,
    powerUpsUsed: gameData.powerUps
  })
});

// Claim rewards
const claimResponse = await fetch('/api/v1/game/reward/claim', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    runId: gameData.runId
  })
});
```

### Production Considerations
1. **Redis Integration**: Replace in-memory rate limiting with Redis
2. **Blockchain Integration**: Implement actual token minting/transfer
3. **Advanced Anti-Cheat**: Add machine learning-based anomaly detection
4. **Monitoring**: Add comprehensive logging and alerting
5. **Caching**: Implement caching for leaderboard and statistics
6. **Database Optimization**: Add proper indexes and query optimization