# Concert Finder - Backend

## Overview

This is the serverless backend for Concert Finder built with AWS Lambda, API Gateway, and DynamoDB.

## Tech Stack

- **AWS Lambda** - Serverless compute (Node.js 18)
- **API Gateway** - REST API management
- **DynamoDB** - NoSQL database
- **AWS Cognito** - User authentication
- **AWS Secrets Manager** - API key storage
- **AWS SES/SNS** - Notifications

## Directory Structure

```
backend/
├── functions/              # Lambda function handlers
│   ├── auth/              # Authentication functions
│   ├── concerts/          # Concert-related functions
│   ├── spotify/           # Spotify integration
│   ├── notifications/     # Notification functions
│   └── recommendations/   # AI recommendations (Phase 3)
├── lib/                   # Shared code
│   ├── utils/            # Helper functions
│   ├── db/               # DynamoDB access layer
│   └── external-apis/    # API client wrappers
├── layers/               # Lambda layers (shared dependencies)
│   └── common-layer/
│       └── nodejs/
└── package.json          # Dependencies
```

## Lambda Functions

### Auth Functions
- `loginHandler` - User login
- `registerHandler` - User registration
- `refreshTokenHandler` - Token refresh

### Concert Functions
- `getConcertsHandler` - Get user's upcoming concerts
- `getConcertByIdHandler` - Get concert details
- `refreshConcertsHandler` - Scheduled job to update concert data

### Spotify Functions
- `spotifyAuthHandler` - Initiate OAuth flow
- `spotifyCallbackHandler` - Complete OAuth flow
- `refreshSpotifyArtistsHandler` - Update user's artists

### Notification Functions
- `sendNotificationHandler` - Send concert notifications
- `getNotificationsHandler` - Get user's notifications
- `markNotificationReadHandler` - Mark notification as read

## Development

### Local Testing with SAM

```bash
# Install dependencies
npm install

# Start local API
sam local start-api

# Test a function locally
sam local invoke GetConcertsFunction -e events/get-concerts.json
```

### Environment Variables

Lambda functions receive environment variables from CloudFormation:

```
USERS_TABLE_NAME=concert-finder-main
AWS_REGION=us-west-2
SPOTIFY_CLIENT_ID_SECRET=concert-finder/spotify
TICKETMASTER_API_KEY_SECRET=concert-finder/ticketmaster
```

## Data Access Layer

All DynamoDB access should go through `lib/db/`:

```javascript
import { getUser, updateUser } from '../lib/db/users.js';
import { getConcertsByArtist } from '../lib/db/concerts.js';

// In your handler:
export const handler = async (event) => {
  const userId = event.requestContext.authorizer.claims.sub;
  const user = await getUser(userId);
  // ... use user data
};
```

## API Integration

External API clients are in `lib/external-apis/`:

```javascript
import SpotifyClient from '../lib/external-apis/spotify.js';
import TicketmasterClient from '../lib/external-apis/ticketmaster.js';

// In your handler:
const spotify = new SpotifyClient(accessToken);
const artists = await spotify.getUserFollowedArtists();
```

## Error Handling

Use the standard error response format:

```javascript
return {
  statusCode: 404,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Concert not found',
      details: { concertId }
    }
  })
};
```

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Test coverage
npm run coverage
```

## Deployment

Backend is deployed via AWS CloudFormation:

```bash
# Deploy stack
aws cloudformation create-stack \
  --stack-name concert-finder-dev \
  --template-body file://infrastructure/main.yaml \
  --capabilities CAPABILITY_IAM

# Update existing stack
aws cloudformation update-stack \
  --stack-name concert-finder-dev \
  --template-body file://infrastructure/main.yaml \
  --capabilities CAPABILITY_IAM
```

## Logging

All Lambda functions automatically log to CloudWatch:

```javascript
console.log('Processing concert search', { userId, artistId });
console.error('Failed to fetch concerts', error);
```

View logs:
```bash
aws logs tail /aws/lambda/GetConcertsFunction --follow
```

## Security

- Never hardcode API keys (use Secrets Manager)
- Always validate input
- Use principle of least privilege for IAM roles
- Encrypt sensitive data before storing in DynamoDB
- Enable X-Ray tracing for debugging

## Performance

- Keep Lambda functions small and focused
- Use Lambda layers for shared dependencies
- Implement caching where possible
- Batch DynamoDB operations
- Set appropriate timeout and memory limits
