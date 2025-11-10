# API Design Specification

## Document Overview

This document defines all API endpoints for the Concert Finder application using OpenAPI 3.0 specification format. It serves as a contract between frontend and backend developers.

**Version**: 1.0
**Last Updated**: 2025-11-09
**Base URL**: `https://api.concert-finder.com/v1` (production)
**Base URL**: `https://dev-api.concert-finder.com/v1` (development)

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Error Responses](#error-responses)
4. [Endpoints](#endpoints)
   - [Authentication & Users](#authentication--users)
   - [Music Service Integration](#music-service-integration)
   - [Concerts](#concerts)
   - [Notifications](#notifications)
   - [Recommendations (Phase 3)](#recommendations-phase-3)
5. [Rate Limiting](#rate-limiting)
6. [Pagination](#pagination)
7. [OpenAPI Specification](#openapi-specification)

---

## API Overview

### Design Principles

1. **RESTful**: Follow REST conventions (GET, POST, PUT, DELETE)
2. **Versioned**: API version in URL path (`/v1/`)
3. **JSON**: All requests and responses use JSON
4. **HTTPS Only**: No unencrypted communication
5. **Stateless**: Each request contains all necessary information
6. **Idempotent**: Duplicate requests have same effect
7. **Consistent**: Uniform naming and structure

### HTTP Methods

- **GET**: Retrieve resources (idempotent, cacheable)
- **POST**: Create resources or trigger actions
- **PUT**: Update entire resource (idempotent)
- **PATCH**: Update partial resource
- **DELETE**: Remove resource (idempotent)

### Response Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE (no response body) |
| 400 | Bad Request | Invalid request format or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists or conflict |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary outage |

---

## Authentication

### JWT Token-Based Authentication

All API requests (except public endpoints) require authentication via JWT token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining Tokens

Tokens are issued by AWS Cognito during user login. See [Authentication Endpoints](#authentication--users).

### Token Contents

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "cognito:username": "user@example.com",
  "exp": 1234567890,
  "iat": 1234564290
}
```

### Token Expiration

- **ID Token**: 1 hour
- **Access Token**: 1 hour
- **Refresh Token**: 30 days

Frontend must refresh tokens before expiration using the refresh token.

---

## Error Responses

### Standard Error Format

All errors follow this structure:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested concert was not found",
    "details": {
      "concertId": "123e4567-e89b-12d3-a456-426614174000"
    },
    "timestamp": "2025-11-09T12:34:56Z",
    "requestId": "req-abc123"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | User lacks necessary permissions |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `VALIDATION_ERROR` | Request validation failed |
| `CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `EXTERNAL_API_ERROR` | Third-party service error (Spotify, Ticketmaster) |
| `INTERNAL_ERROR` | Unexpected server error |

### Example Error Responses

**401 Unauthorized:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is missing or invalid",
    "timestamp": "2025-11-09T12:34:56Z"
  }
}
```

**400 Validation Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "startDate": "Must be a valid ISO 8601 date"
      }
    },
    "timestamp": "2025-11-09T12:34:56Z"
  }
}
```

---

## Endpoints

### Authentication & Users

#### Register User

**Note**: User registration is handled by AWS Cognito directly from frontend using AWS SDK. No custom API endpoint needed.

```javascript
// Frontend code example
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const userPool = new CognitoUserPool({
  UserPoolId: 'us-west-2_abc123',
  ClientId: 'client-id'
});

userPool.signUp('email', 'password', [], null, callback);
```

#### Login

**Note**: Login is also handled by Cognito directly from frontend.

```javascript
// Frontend code example
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const authDetails = new AuthenticationDetails({
  Username: 'email',
  Password: 'password'
});

cognitoUser.authenticateUser(authDetails, callbacks);
```

#### GET /users/me

Get current user's profile and preferences.

**Authentication**: Required

**Request:**
```http
GET /v1/users/me
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "createdAt": "2025-01-15T10:30:00Z",
    "musicServices": {
      "spotify": {
        "connected": true,
        "connectedAt": "2025-01-15T11:00:00Z",
        "displayName": "John Doe"
      },
      "appleMusic": {
        "connected": false
      }
    },
    "preferences": {
      "notifications": {
        "email": true,
        "sms": false
      },
      "location": {
        "city": "Denver",
        "state": "CO",
        "radius": 50
      }
    },
    "statistics": {
      "totalArtistsFollowed": 47,
      "upcomingConcerts": 12,
      "concertsAttended": 3
    }
  }
}
```

#### PATCH /users/me/preferences

Update user preferences.

**Authentication**: Required

**Request:**
```http
PATCH /v1/users/me/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "notifications": {
    "email": true,
    "sms": true,
    "frequency": "immediate"
  },
  "location": {
    "city": "Denver",
    "state": "CO",
    "radius": 75
  },
  "filters": {
    "minPrice": 0,
    "maxPrice": 150,
    "preferredVenues": [
      "Red Rocks Amphitheatre",
      "Ball Arena"
    ]
  }
}
```

**Response (200 OK):**
```json
{
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "preferences": {
      "notifications": {
        "email": true,
        "sms": true,
        "frequency": "immediate"
      },
      "location": {
        "city": "Denver",
        "state": "CO",
        "radius": 75
      },
      "filters": {
        "minPrice": 0,
        "maxPrice": 150,
        "preferredVenues": [
          "Red Rocks Amphitheatre",
          "Ball Arena"
        ]
      }
    },
    "updatedAt": "2025-11-09T12:45:00Z"
  }
}
```

---

### Music Service Integration

#### POST /integrations/spotify/authorize

Initiate Spotify OAuth flow.

**Authentication**: Required

**Request:**
```http
POST /v1/integrations/spotify/authorize
Authorization: Bearer {token}
Content-Type: application/json

{
  "redirectUri": "https://concert-finder.com/callback"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "authorizationUrl": "https://accounts.spotify.com/authorize?client_id=...&redirect_uri=...&scope=user-follow-read+user-top-read&response_type=code&state=abc123"
  }
}
```

**Flow**:
1. Frontend calls this endpoint
2. Backend generates authorization URL with state parameter
3. Frontend redirects user to authorization URL
4. User authorizes on Spotify
5. Spotify redirects back to redirectUri with code
6. Frontend calls `/integrations/spotify/callback` with code

#### POST /integrations/spotify/callback

Complete Spotify OAuth flow and fetch user's artists.

**Authentication**: Required

**Request:**
```http
POST /v1/integrations/spotify/callback
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "spotify-authorization-code",
  "state": "abc123"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "connected": true,
    "displayName": "John Doe",
    "artistsImported": 47,
    "message": "Successfully connected Spotify and imported 47 artists"
  }
}
```

**Processing**:
1. Exchange code for Spotify access/refresh tokens
2. Store encrypted tokens in DynamoDB
3. Fetch user's followed artists
4. Fetch user's top artists
5. Store artists in UserArtists table
6. Trigger concert search for new artists

#### DELETE /integrations/spotify

Disconnect Spotify integration.

**Authentication**: Required

**Request:**
```http
DELETE /v1/integrations/spotify
Authorization: Bearer {token}
```

**Response (204 No Content)**

#### GET /integrations/spotify/artists

Get user's imported Spotify artists.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `sort` (optional): Sort order (`name`, `addedAt`, `concertCount`) (default: `name`)

**Request:**
```http
GET /v1/integrations/spotify/artists?limit=20&offset=0&sort=concertCount
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": {
    "artists": [
      {
        "id": "spotify:artist:abc123",
        "name": "The Lumineers",
        "imageUrl": "https://i.scdn.co/image/abc123",
        "genres": ["folk", "indie"],
        "addedAt": "2025-01-15T11:00:00Z",
        "upcomingConcerts": 2
      },
      {
        "id": "spotify:artist:def456",
        "name": "Gregory Alan Isakov",
        "imageUrl": "https://i.scdn.co/image/def456",
        "genres": ["folk", "singer-songwriter"],
        "addedAt": "2025-01-15T11:00:00Z",
        "upcomingConcerts": 1
      }
    ],
    "pagination": {
      "total": 47,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### POST /integrations/spotify/refresh

Manually trigger refresh of Spotify artists (normally happens automatically daily).

**Authentication**: Required

**Request:**
```http
POST /v1/integrations/spotify/refresh
Authorization: Bearer {token}
```

**Response (202 Accepted):**
```json
{
  "data": {
    "message": "Artist refresh initiated. This may take a few minutes.",
    "jobId": "job-abc123"
  }
}
```

---

### Concerts

#### GET /concerts

Get upcoming concerts (personalized to user's artists).

**Authentication**: Required

**Query Parameters**:
- `startDate` (optional): ISO 8601 date (default: today)
- `endDate` (optional): ISO 8601 date (default: 6 months from today)
- `artistId` (optional): Filter by specific artist
- `venue` (optional): Filter by venue name
- `minPrice` (optional): Minimum ticket price
- `maxPrice` (optional): Maximum ticket price
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `sort` (optional): Sort order (`date`, `price`, `artistName`) (default: `date`)

**Request:**
```http
GET /v1/concerts?startDate=2025-06-01&endDate=2025-08-31&limit=20
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": {
    "concerts": [
      {
        "id": "concert-abc123",
        "artist": {
          "id": "spotify:artist:abc123",
          "name": "The Lumineers",
          "imageUrl": "https://i.scdn.co/image/abc123"
        },
        "event": {
          "name": "The Lumineers - Summer Tour",
          "date": "2025-07-15",
          "time": "19:00:00",
          "timezone": "America/Denver",
          "doors": "18:00:00"
        },
        "venue": {
          "name": "Red Rocks Amphitheatre",
          "city": "Morrison",
          "state": "CO",
          "address": "18300 W Alameda Pkwy",
          "coordinates": {
            "latitude": 39.6654,
            "longitude": -105.2057
          }
        },
        "tickets": {
          "available": true,
          "priceRange": {
            "min": 65.00,
            "max": 125.00,
            "currency": "USD"
          },
          "purchaseUrl": "https://www.ticketmaster.com/event/abc123"
        },
        "metadata": {
          "addedAt": "2025-02-01T10:00:00Z",
          "source": "ticketmaster",
          "lastUpdated": "2025-02-01T10:00:00Z"
        }
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### GET /concerts/{concertId}

Get detailed information about a specific concert.

**Authentication**: Required

**Request:**
```http
GET /v1/concerts/concert-abc123
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "concert-abc123",
    "artist": {
      "id": "spotify:artist:abc123",
      "name": "The Lumineers",
      "imageUrl": "https://i.scdn.co/image/abc123",
      "genres": ["folk", "indie"],
      "spotifyUrl": "https://open.spotify.com/artist/abc123"
    },
    "event": {
      "name": "The Lumineers - Summer Tour",
      "description": "Join The Lumineers for an unforgettable night...",
      "date": "2025-07-15",
      "time": "19:00:00",
      "timezone": "America/Denver",
      "doors": "18:00:00",
      "ageRestriction": "All Ages"
    },
    "venue": {
      "name": "Red Rocks Amphitheatre",
      "city": "Morrison",
      "state": "CO",
      "address": "18300 W Alameda Pkwy",
      "coordinates": {
        "latitude": 39.6654,
        "longitude": -105.2057
      },
      "capacity": 9525,
      "parkingInfo": "Parking available on-site ($30)",
      "venueUrl": "https://www.redrocksonline.com"
    },
    "tickets": {
      "available": true,
      "priceRange": {
        "min": 65.00,
        "max": 125.00,
        "currency": "USD"
      },
      "ticketTypes": [
        {
          "name": "General Admission",
          "price": 65.00
        },
        {
          "name": "Reserved Seating",
          "price": 125.00
        }
      ],
      "purchaseUrl": "https://www.ticketmaster.com/event/abc123",
      "salesStart": "2025-02-01T10:00:00Z",
      "salesEnd": "2025-07-15T18:00:00Z"
    },
    "lineup": {
      "headliner": "The Lumineers",
      "supportingActs": [
        "James Bay",
        "Local Opening Act"
      ]
    },
    "metadata": {
      "addedAt": "2025-02-01T10:00:00Z",
      "source": "ticketmaster",
      "sourceId": "tm-event-123",
      "lastUpdated": "2025-02-01T10:00:00Z"
    }
  }
}
```

#### GET /concerts/discover

Discover all upcoming concerts in Denver (not just user's artists).

**Authentication**: Required

**Query Parameters**: Same as `GET /concerts`

**Response**: Same format as `GET /concerts`

**Use Case**: Browse all concerts to discover new artists

---

### Notifications

#### GET /notifications

Get user's notification history.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset
- `read` (optional): Filter by read status (`true`, `false`, `all`) (default: `all`)
- `type` (optional): Filter by type (`concert_announced`, `price_drop`, `recommendation`)

**Request:**
```http
GET /v1/notifications?limit=10&read=false
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": {
    "notifications": [
      {
        "id": "notif-abc123",
        "type": "concert_announced",
        "title": "The Lumineers announced a Denver show!",
        "message": "The Lumineers will be performing at Red Rocks on July 15, 2025.",
        "data": {
          "concertId": "concert-abc123",
          "artistId": "spotify:artist:abc123",
          "artistName": "The Lumineers"
        },
        "read": false,
        "sentAt": "2025-02-01T10:05:00Z",
        "channels": {
          "email": {
            "sent": true,
            "sentAt": "2025-02-01T10:05:00Z"
          },
          "sms": {
            "sent": false
          }
        }
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### PATCH /notifications/{notificationId}

Mark notification as read.

**Authentication**: Required

**Request:**
```http
PATCH /v1/notifications/notif-abc123
Authorization: Bearer {token}
Content-Type: application/json

{
  "read": true
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "notif-abc123",
    "read": true,
    "readAt": "2025-11-09T13:00:00Z"
  }
}
```

#### POST /notifications/mark-all-read

Mark all notifications as read.

**Authentication**: Required

**Request:**
```http
POST /v1/notifications/mark-all-read
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": {
    "markedRead": 5,
    "message": "Marked 5 notifications as read"
  }
}
```

---

### Recommendations (Phase 3)

#### GET /recommendations/concerts

Get AI-powered concert recommendations.

**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of recommendations (default: 10, max: 20)
- `genre` (optional): Filter by genre
- `startDate` (optional): Earliest concert date
- `endDate` (optional): Latest concert date

**Request:**
```http
GET /v1/recommendations/concerts?limit=5
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": {
    "recommendations": [
      {
        "concert": {
          "id": "concert-xyz789",
          "artist": {
            "id": "artist-xyz789",
            "name": "Nathaniel Rateliff & The Night Sweats",
            "imageUrl": "https://example.com/image.jpg"
          },
          "event": {
            "name": "Nathaniel Rateliff - Fall Tour",
            "date": "2025-09-20",
            "time": "20:00:00"
          },
          "venue": {
            "name": "The Fillmore Auditorium",
            "city": "Denver",
            "state": "CO"
          },
          "tickets": {
            "priceRange": {
              "min": 45.00,
              "max": 85.00,
              "currency": "USD"
            },
            "purchaseUrl": "https://ticketmaster.com/..."
          }
        },
        "recommendation": {
          "score": 0.92,
          "reason": "Based on your love for The Lumineers and Gregory Alan Isakov, you'll enjoy Nathaniel Rateliff's soulful folk-rock sound. They share similar storytelling approaches and often tour together.",
          "similarToArtists": [
            "The Lumineers",
            "Gregory Alan Isakov"
          ],
          "matchingGenres": ["folk", "indie", "americana"]
        }
      }
    ],
    "metadata": {
      "generatedAt": "2025-11-09T13:30:00Z",
      "basedOn": {
        "listeningHistory": true,
        "followedArtists": true,
        "concertHistory": false
      }
    }
  }
}
```

#### POST /recommendations/feedback

Provide feedback on a recommendation.

**Authentication**: Required

**Request:**
```http
POST /v1/recommendations/feedback
Authorization: Bearer {token}
Content-Type: application/json

{
  "concertId": "concert-xyz789",
  "helpful": true,
  "attended": false,
  "comment": "Great recommendation! I love this artist."
}
```

**Response (201 Created):**
```json
{
  "data": {
    "message": "Thank you for your feedback! This helps us improve recommendations.",
    "feedbackId": "feedback-abc123"
  }
}
```

---

## Rate Limiting

### Limits

| User Type | Requests/Minute | Requests/Hour | Requests/Day |
|-----------|----------------|---------------|--------------|
| Free | 60 | 1,000 | 10,000 |
| Premium (future) | 120 | 5,000 | 50,000 |

### Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699545600
```

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the rate limit. Please try again later.",
    "details": {
      "limit": 60,
      "retryAfter": 45
    },
    "timestamp": "2025-11-09T13:45:00Z"
  }
}
```

---

## Pagination

### Query Parameters

- `limit`: Number of results per page (default varies by endpoint)
- `offset`: Number of results to skip (default: 0)

### Response Format

All paginated responses include a `pagination` object:

```json
{
  "pagination": {
    "total": 47,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Example Pagination Flow

**Page 1:**
```http
GET /v1/concerts?limit=20&offset=0
```

**Page 2:**
```http
GET /v1/concerts?limit=20&offset=20
```

**Page 3:**
```http
GET /v1/concerts?limit=20&offset=40
```

---

## OpenAPI Specification

A complete OpenAPI 3.0 specification file is available at:
- **Development**: `https://dev-api.concert-finder.com/openapi.json`
- **Production**: `https://api.concert-finder.com/openapi.json`

### Using the Spec

1. **API Documentation**: Import into Swagger UI or Redoc
2. **Code Generation**: Generate client SDKs using OpenAPI Generator
3. **Testing**: Use with Postman or Insomnia
4. **Validation**: Validate requests and responses

### Example Usage with OpenAPI Generator

```bash
# Generate TypeScript client
openapi-generator-cli generate \
  -i https://api.concert-finder.com/openapi.json \
  -g typescript-axios \
  -o ./src/api-client

# Generate Python client
openapi-generator-cli generate \
  -i https://api.concert-finder.com/openapi.json \
  -g python \
  -o ./python-client
```

---

## Testing the API

### Using cURL

```bash
# Get user profile
curl -X GET https://api.concert-finder.com/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get concerts
curl -X GET "https://api.concert-finder.com/v1/concerts?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update preferences
curl -X PATCH https://api.concert-finder.com/v1/users/me/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notifications": {"email": true}}'
```

### Using JavaScript (Frontend)

```javascript
// Using fetch
const response = await fetch('https://api.concert-finder.com/v1/concerts', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// Using axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.concert-finder.com/v1',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await api.get('/concerts', {
  params: { limit: 10 }
});
```

---

## Versioning Strategy

### Current Version: v1

The API uses URL path versioning (`/v1/`). When breaking changes are necessary, we'll release a new version (`/v2/`) and maintain backwards compatibility for a deprecation period.

### Breaking vs Non-Breaking Changes

**Breaking Changes** (require new version):
- Removing an endpoint
- Removing a field from response
- Changing field types
- Changing required fields
- Changing authentication method

**Non-Breaking Changes** (can be done in current version):
- Adding new endpoints
- Adding new optional fields
- Adding new query parameters
- Adding new error codes

### Deprecation Policy

- **Notice**: 6 months before removal
- **Support**: Old version maintained for 6 months after new version release
- **Communication**: Email to all users, API headers, documentation

---

## Changelog

### v1.0.0 (2025-11-09)
- Initial API design specification
- Core endpoints for authentication, music integration, concerts, notifications
- Planned Phase 3 recommendations endpoints

---

## Next Steps

1. ✅ Review and approve this API design
2. [ ] Generate full OpenAPI 3.0 specification file
3. [ ] Set up API Gateway with these endpoints
4. [ ] Implement Lambda handlers for each endpoint
5. [ ] Create API documentation website (Swagger UI)
6. [ ] Write integration tests

---

**Document Status**: Draft - Pending Review
**Author**: Concert Finder Development Team
**Last Updated**: 2025-11-09
