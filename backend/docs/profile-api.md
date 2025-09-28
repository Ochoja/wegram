# Profile API Documentation

## Overview
The Profile API allows users to manage their profile information including username and about section with proper validation and uniqueness checks.

## Authentication
Most endpoints require JWT authentication via:
- **Bearer token**: `Authorization: Bearer <jwt_token>`
- **Cookie**: JWT token set automatically after OAuth

## Endpoints

### GET /api/v1/profile/me
**Summary:** Get current user's profile  
**Authentication:** Required (JWT token)

**Description:** Retrieves the authenticated user's profile. If no profile exists, creates one automatically with default values from the User model.

**Response (200):**
```json
{
  "status": 200,
  "message": "Profile fetched successfully",
  "data": {
    "username": "johndoe123",
    "about": "Love gaming and Web3!",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:45:00.000Z"
  }
}
```

---

### PUT /api/v1/profile/me
**Summary:** Update current user's profile  
**Authentication:** Required (JWT token)

**Description:** Updates the authenticated user's profile with validation for username uniqueness and text limits.

**Request Body:**
```json
{
  "username": "newusername123",
  "about": "Updated bio with new information about myself"
}
```

**Validation Rules:**
- **Username**: 
  - Required if provided
  - 3-30 characters
  - Alphanumeric and underscore only (`a-zA-Z0-9_`)
  - Must be unique across all profiles
  - Case insensitive (stored as lowercase)
- **About**: 
  - Optional
  - Maximum 500 characters
  - HTML tags stripped for security

**Response (200):**
```json
{
  "status": 200,
  "message": "Profile updated successfully",
  "data": {
    "username": "newusername123",
    "about": "Updated bio with new information about myself",
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation failed (invalid format, length, or username taken)
- `404`: Profile not found

---

### GET /api/v1/profile/check-username/:username
**Summary:** Check username availability  
**Authentication:** Required (JWT token)

**Description:** Validates username format and checks availability. Excludes current user's username from uniqueness check.

**Path Parameters:**
- `username` (required): Username to check

**Response (200):**
```json
{
  "status": 200,
  "message": "Username availability checked",
  "data": {
    "username": "testusername",
    "available": true
  }
}
```

**Response - Username Taken (200):**
```json
{
  "status": 200,
  "message": "Username availability checked",
  "data": {
    "username": "testusername",
    "available": false
  }
}
```

**Error Responses:**
- `400`: Invalid username format or length

---

### GET /api/v1/profile/:username
**Summary:** Get profile by username  
**Authentication:** None required (public endpoint)

**Description:** Retrieves a user's public profile information by username.

**Path Parameters:**
- `username` (required): Username to lookup

**Response (200):**
```json
{
  "status": 200,
  "message": "Profile fetched successfully",
  "data": {
    "username": "johndoe123",
    "about": "Love gaming and Web3!",
    "displayName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "memberSince": "2024-01-01T00:00:00.000Z",
    "profileCreatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Username required
- `404`: Profile not found

## Data Model

### Profile Schema
```javascript
{
  userId: ObjectId,           // Reference to User model
  username: String,           // Unique, 3-30 chars, alphanumeric + underscore
  about: String,              // Max 500 characters
  isActive: Boolean,          // Soft delete flag
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

## Frontend Integration Examples

### Get Current User Profile
```javascript
const response = await fetch('/api/v1/profile/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const profile = await response.json();
```

### Update Profile
```javascript
const response = await fetch('/api/v1/profile/me', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'newusername',
    about: 'My updated bio'
  })
});
```

### Check Username Availability
```javascript
const response = await fetch(`/api/v1/profile/check-username/${username}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
console.log('Available:', data.available);
```

### Get Public Profile
```javascript
const response = await fetch(`/api/v1/profile/${username}`);
const profile = await response.json();
```

## Error Codes
- **200**: Success
- **400**: Bad request (validation failed)
- **401**: Unauthorized (missing/invalid token)
- **404**: Profile not found
- **500**: Internal server error

## Security Features
- Input sanitization to prevent XSS
- Username format validation
- Text length limits
- Unique constraint enforcement
- Case-insensitive username handling
- Soft delete support

## Notes
- Usernames are stored in lowercase for consistency
- Profile creation is automatic when accessing `/me` for the first time
- Username uniqueness is enforced at database level
- About section supports basic text with HTML stripped for security