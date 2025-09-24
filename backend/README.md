# Wegram Backend API

A social media backend API for Wegram - a Twitter-like platform that supports user authentication via OAuth, post creation and management, social interactions (likes, reposts, bookmarks), real-time messaging, and content discovery through feeds.

## Available Endpoints

### Authentication Endpoints

#### `GET /api/auth/twitter`
**Summary:** Initiate Twitter OAuth authentication  
**Authentication:** None required  
**Description:** Redirects users to Twitter's OAuth consent screen to authorize the application. Requests permissions for tweet reading, user profile access, and offline access.

#### `GET /api/auth/twitter/callback`
**Summary:** Handle Twitter OAuth callback  
**Authentication:** None required (OAuth flow)  
**Description:** Processes the OAuth callback from Twitter after user authorization. Exchanges authorization code for access token, retrieves user profile, creates/updates user account, generates JWT token, and sets authentication cookie.

---

### Posts Management

#### `GET /api/v1/posts/feed`
**Summary:** Get public posts feed  
**Authentication:** Optional (provides personalized status when authenticated)  
**Description:** Retrieves a paginated feed of public posts from all users. Supports sorting by latest (default) or trending. Includes author information, media attachments, engagement counts, and user interaction status.

**Query Parameters:**
- `page` (optional): Page number for pagination (min: 1, default: 1)
- `limit` (optional): Posts per page (max: 100, default: 20)
- `sortBy` (optional): Sort order - `latest` or `trending` (default: latest)

#### `GET /api/v1/posts/{id}`
**Summary:** Get specific post by ID  
**Authentication:** Optional (provides personalized status when authenticated)  
**Description:** Retrieves a single post by its unique identifier. Returns complete post information including content, author details, engagement metrics, and user interaction status.

**Path Parameters:**
- `id` (required): Unique post identifier (MongoDB ObjectId)

#### `GET /api/v1/posts/{userId}`
**Summary:** Get posts by specific user  
**Authentication:** Optional (provides personalized status when authenticated)  
**Description:** Retrieves all posts created by a specific user, paginated and sorted by creation date (newest first). Useful for user profiles and individual timelines.

**Path Parameters:**
- `userId` (required): Unique user identifier (MongoDB ObjectId)

**Query Parameters:**
- `page` (optional): Page number for pagination (min: 1, default: 1)
- `limit` (optional): Posts per page (max: 100, default: 20)

---

### User Posts Management (Authentication Required)

#### `POST /api/v1/posts`
**Summary:** Create a new post  
**Authentication:** Required (JWT token)  
**Description:** Creates a new post with text content and/or media attachments. Post must contain either text content or media (or both). Content cannot exceed 2000 characters.

**Request Body:**
- `content` (optional): Text content of the post (max: 2000 characters)
- `media` (optional): Array of media attachments with URL, MIME type, and size

#### `PUT /api/v1/posts/{id}`
**Summary:** Update an existing post  
**Authentication:** Required (JWT token + post ownership)  
**Description:** Updates an existing post's content and/or media attachments. Only the post author can update their own posts. Supports partial updates.

**Path Parameters:**
- `id` (required): Unique post identifier (MongoDB ObjectId)

**Request Body:**
- `content` (optional): Updated text content
- `media` (optional): Updated media attachments

#### `DELETE /api/v1/posts/{id}`
**Summary:** Delete a post  
**Authentication:** Required (JWT token + post ownership)  
**Description:** Permanently deletes a post and all associated data. Only the post author can delete their own posts. Removes post from all user bookmarks and deletes associated comments.

**Path Parameters:**
- `id` (required): Unique post identifier (MongoDB ObjectId)

---

### Social Interactions (Authentication Required)

#### `POST /api/v1/posts/{id}/like`
**Summary:** Like or unlike a post  
**Authentication:** Required (JWT token)  
**Description:** Toggles the like status of a post for the authenticated user. If not liked, adds a like and increments count. If already liked, removes like and decrements count.

**Path Parameters:**
- `id` (required): Unique post identifier (MongoDB ObjectId)

**Response:** Returns updated like count and current like status for the user.

#### `POST /api/v1/posts/{id}/repost`
**Summary:** Repost or undo repost  
**Authentication:** Required (JWT token)  
**Description:** Toggles the repost status of a post for the authenticated user. Similar to retweeting - shares the post to the user's timeline. Returns updated repost count and current status.

**Path Parameters:**
- `id` (required): Unique post identifier (MongoDB ObjectId)

**Response:** Returns updated repost count and current repost status for the user.

#### `POST /api/v1/posts/{id}/bookmark`
**Summary:** Bookmark or remove bookmark  
**Authentication:** Required (JWT token)  
**Description:** Toggles the bookmark status of a post for the authenticated user. Bookmarks are private saved posts that users can access later from their profile.

**Path Parameters:**
- `id` (required): Unique post identifier (MongoDB ObjectId)

**Response:** Returns updated bookmark count and current bookmark status for the user.

---

### Messages Management (Authentication Required)

#### `GET /api/v1/messages/conversations`
**Summary:** Get all conversations for authenticated user  
**Authentication:** Required (JWT token)  
**Description:** Retrieves a paginated list of all conversations for the authenticated user, including participant information, last message, and unread counts.

**Query Parameters:**
- `page` (optional): Page number for pagination (min: 1, default: 1)
- `limit` (optional): Conversations per page (max: 50, default: 20)

#### `GET /api/v1/messages/conversations/{conversationId}/messages`
**Summary:** Get messages in a conversation  
**Authentication:** Required (JWT token + conversation access)  
**Description:** Retrieves messages from a specific conversation. Automatically marks messages as read for the authenticated user.

**Path Parameters:**
- `conversationId` (required): Unique conversation identifier

**Query Parameters:**
- `page` (optional): Page number for pagination (min: 1, default: 1)
- `limit` (optional): Messages per page (max: 100, default: 50)

#### `POST /api/v1/messages/send`
**Summary:** Send a new message  
**Authentication:** Required (JWT token)  
**Description:** Sends a message to another user. Creates a new conversation if one doesn't exist between the users.

**Request Body:**
- `recipientId` (required): User ID of the message recipient
- `content` (required): Message content (max: 1000 characters)
- `messageType` (optional): Type of message - `text`, `image`, or `file` (default: text)
- `media` (optional): Media attachment object with URL, MIME type, and size

#### `DELETE /api/v1/messages/{messageId}`
**Summary:** Delete a message  
**Authentication:** Required (JWT token + message ownership)  
**Description:** Soft deletes a message. Only the sender can delete their own messages.

**Path Parameters:**
- `messageId` (required): Unique message identifier

#### `PUT /api/v1/messages/conversations/{conversationId}/read`
**Summary:** Mark messages as read  
**Authentication:** Required (JWT token + conversation access)  
**Description:** Marks all unread messages in a conversation as read for the authenticated user.

**Path Parameters:**
- `conversationId` (required): Unique conversation identifier

#### `GET /api/v1/messages/users/search`
**Summary:** Search users for messaging  
**Authentication:** Required (JWT token)  
**Description:** Search for users by display name or handle to start new conversations.

**Query Parameters:**
- `query` (required): Search term (min: 2 characters)

---

## Authentication

The API uses JWT-based authentication with Twitter OAuth for user registration and login. Protected endpoints require either:

- **Bearer token in Authorization header:** `Authorization: Bearer <jwt_token>`
- **JWT token in cookies:** Set automatically after OAuth callback

## Response Format

All API responses follow a consistent format:

```json
{
  "status": 200,
  "message": "Success message",
  "data": {} // Response payload (null for errors)
}
```

## Error Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (invalid parameters)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **500**: Internal server error

## Base URLs

- **Development**: `http://localhost:3000`
- **Production**: Contact administrator for production URL

## API Documentation

For detailed API documentation with request/response schemas, examples, and testing capabilities, see the `openapi.yaml` file in this directory. This file can be imported into Postman, Swagger UI, or any OpenAPI-compatible tool.

## Getting Started

1. Start the development server: `npm start`
2. Access the API at `http://localhost:3000` (or your configured PORT)
3. Use `/api/auth/twitter` to authenticate via Twitter OAuth
4. Use the JWT token for authenticated endpoints
5. Set up your environment variables using `.env-example` as a template

## Environment Variables

Create a `.env` file based on `.env-example`:

```env
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
BASE_URL=http://localhost:3000
TWITTER_CALLBACK_URL=http://localhost:3000/api/auth/twitter/callback
JWT_SECRET=your_jwt_secret_key
FRONTEND_LOGIN_ENDPOINT=http://localhost:3000/auth/login
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_session_secret
NODE_ENV=dev
MONGODB_URI=mongodb://localhost:27017/wegram
PORT=3000
```

## Database Models

- **Users**: User profiles and authentication data
- **Posts**: Social media posts with content and media
- **Comments**: Comments on posts
- **Messages**: Direct messages between users
- **Conversations**: Conversation metadata and unread counts

## Features

- ✅ Twitter OAuth authentication
- ✅ Post creation, editing, and deletion
- ✅ Social interactions (likes, reposts, bookmarks)
- ✅ Real-time messaging system
- ✅ Conversation management
- ✅ User search for messaging
- ✅ Pagination for all list endpoints
- ✅ Input validation and sanitization
- ✅ Error handling and logging