# Technical Specifications

## Document Overview

This document provides a comprehensive technical specification for the Concert Finder application. It defines the architecture, technology choices, data flow, and implementation details.

**Version**: 1.0
**Last Updated**: 2025-11-09
**Status**: Draft

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Requirements](#requirements)
3. [Architecture](#architecture)
4. [Technology Stack Details](#technology-stack-details)
5. [Data Flow](#data-flow)
6. [Security & Authentication](#security--authentication)
7. [External API Integrations](#external-api-integrations)
8. [AWS Services Configuration](#aws-services-configuration)
9. [Performance & Scalability](#performance--scalability)
10. [Cost Estimation](#cost-estimation)
11. [Development Phases](#development-phases)

---

## System Overview

### Purpose

Concert Finder is a serverless web application that helps music enthusiasts stay informed about concerts from their favorite artists in the Denver area. Users manually track artists they care about, and the system automatically finds and notifies them about upcoming Denver-area concerts.

### Key Objectives

1. **Automation**: Eliminate manual checking of concert announcements
2. **Personalization**: Track concerts for artists you care about
3. **Timeliness**: Notify users as soon as relevant concerts are announced
4. **Discovery**: Help users find new artists and concerts they'll enjoy (Phase 3)
5. **Simplicity**: Provide an intuitive, low-friction user experience

### Target Users

- Music enthusiasts who attend concerts regularly
- People who follow multiple artists across different genres
- Users who want to discover new music and live events
- Denver-area residents and visitors

---

## Requirements

### Functional Requirements

#### FR1: User Authentication
- FR1.1: Users must be able to sign up with email/password
- FR1.2: Users must be able to log in securely
- FR1.3: Users must be able to reset forgotten passwords
- FR1.4: Users must be able to log out
- FR1.5: Sessions must persist across browser refreshes

#### FR2: Artist Management
- FR2.1: Users must be able to manually add artists to their tracking list
- FR2.2: Users must be able to search for artists by name
- FR2.3: Users must be able to remove artists from their tracking list
- FR2.4: Users must be able to view their complete list of tracked artists
- FR2.5: System must validate artist names against concert data sources

#### FR3: Concert Discovery
- FR3.1: System must search for concerts by each favorite artist
- FR3.2: System must filter concerts to Denver metro area
- FR3.3: System must display concert details (venue, date, time, price range)
- FR3.4: System must provide links to purchase tickets
- FR3.5: System must update concert data daily

#### FR4: Notifications
- FR4.1: Users must receive email when favorite artists announce Denver shows
- FR4.2: Users must be able to configure notification preferences
- FR4.3: Users must be able to enable/disable notifications per artist
- FR4.4: System must not send duplicate notifications for the same concert

#### FR5: Concert Browsing
- FR5.1: Users must see a dashboard of upcoming concerts
- FR5.2: Users must be able to filter concerts by date range
- FR5.3: Users must be able to sort concerts by date or artist name
- FR5.4: Users must be able to search for specific artists or venues

#### FR6: User Preferences (Phase 2)
- FR6.1: Users can select preferred venues
- FR6.2: Users can set notification delivery methods (email, SMS)
- FR6.3: Users can define maximum ticket price alerts
- FR6.4: Users can specify preferred days of the week

#### FR7: Music Integration (Future Enhancement)
- FR7.1: Users can optionally connect Spotify or Apple Music
- FR7.2: System can import favorite artists from connected service
- FR7.3: Users can sync artist lists automatically

#### FR8: AI Recommendations (Phase 3)
- FR8.1: System suggests concerts based on tracked artists and genres
- FR8.2: System recommends similar artists with upcoming shows
- FR8.3: System provides explanation for recommendations
- FR8.4: Users can provide feedback on recommendations

### Non-Functional Requirements

#### NFR1: Performance
- NFR1.1: Dashboard must load within 2 seconds
- NFR1.2: API responses must complete within 1 second (95th percentile)
- NFR1.3: Concert data refresh must complete within 5 minutes

#### NFR2: Scalability
- NFR2.1: System must support 10,000 concurrent users
- NFR2.2: Database must handle 1 million concert records
- NFR2.3: System must process 100,000 API requests per day

#### NFR3: Availability
- NFR3.1: System must maintain 99.5% uptime
- NFR3.2: Scheduled maintenance must occur during low-traffic hours
- NFR3.3: System must gracefully handle external API failures

#### NFR4: Security
- NFR4.1: All data transmission must use HTTPS/TLS
- NFR4.2: Passwords must be hashed (handled by Cognito)
- NFR4.3: API tokens must be encrypted at rest
- NFR4.4: System must comply with OWASP top 10 security practices
- NFR4.5: Spotify access tokens must be stored securely

#### NFR5: Cost Efficiency
- NFR5.1: Infrastructure costs must stay under $50/month for 1,000 users
- NFR5.2: System must leverage AWS free tier where possible
- NFR5.3: Unused resources must be automatically scaled down

#### NFR6: Maintainability
- NFR6.1: Code must follow consistent style guidelines
- NFR6.2: All functions must have unit tests (>80% coverage)
- NFR6.3: Infrastructure must be defined as code (CloudFormation)
- NFR6.4: All APIs must be documented (OpenAPI specification)

---

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   User      │
│  Browser    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────────┐
│         AWS CloudFront (CDN)            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      S3 Bucket (Frontend Assets)        │
│         React Application               │
└─────────────────────────────────────────┘
       │
       │ REST API Calls
       ▼
┌─────────────────────────────────────────┐
│         API Gateway (REST)              │
│      /api/v1/* endpoints                │
└──────┬──────────────────────────────────┘
       │
       │ Invokes
       ▼
┌─────────────────────────────────────────┐
│         AWS Lambda Functions            │
│  ┌─────────────────────────────────┐   │
│  │ Auth Handler                    │   │
│  │ Concerts Handler                │   │
│  │ Spotify Integration Handler     │   │
│  │ Notifications Handler           │   │
│  │ Recommendations Handler (AI)    │   │
│  └─────────────────────────────────┘   │
└──────┬──────────────────────────────────┘
       │
       │ Read/Write
       ▼
┌─────────────────────────────────────────┐
│          DynamoDB Tables                │
│  • Users                                │
│  • Concerts                             │
│  • UserArtists                          │
│  • Notifications                        │
└─────────────────────────────────────────┘

       External Integrations:

       ┌──────────────┐
       │ AWS Cognito  │  (Authentication)
       └──────────────┘

       ┌──────────────┐
       │Ticketmaster  │  (Concert data)
       │     API      │
       └──────────────┘

       ┌──────────────┐
       │  AWS SNS     │  (Email notifications)
       │  AWS SES     │
       └──────────────┘

       ┌──────────────┐
       │ EventBridge  │  (Scheduled jobs)
       └──────────────┘

       ┌──────────────┐
       │ AWS Bedrock  │  (AI - Phase 3)
       └──────────────┘
```

### Component Descriptions

#### Frontend Layer
- **Technology**: React + Vite + Tailwind CSS
- **Hosting**: AWS S3 (static website) + CloudFront (CDN)
- **Responsibilities**:
  - User interface rendering
  - Client-side routing
  - API communication
  - State management (React Context or Zustand)
  - Authentication flow (Cognito SDK)

#### API Layer
- **Technology**: AWS API Gateway (REST API)
- **Responsibilities**:
  - Request routing
  - Request validation
  - Authentication verification (Cognito authorizer)
  - Rate limiting
  - CORS configuration
  - API versioning (/api/v1/)

#### Application Layer
- **Technology**: AWS Lambda (Node.js 18)
- **Responsibilities**:
  - Business logic implementation
  - Data validation
  - External API integration
  - Error handling
  - Logging (CloudWatch)

#### Data Layer
- **Technology**: DynamoDB
- **Responsibilities**:
  - Persistent data storage
  - User profiles and preferences
  - Concert information cache
  - Notification history

#### Authentication Layer
- **Technology**: AWS Cognito
- **Responsibilities**:
  - User registration
  - User authentication
  - Password management
  - JWT token issuance

#### Notification Layer
- **Technology**: AWS SNS + SES
- **Responsibilities**:
  - Email delivery
  - SMS delivery (Phase 2)
  - Notification templates
  - Delivery tracking

#### Scheduling Layer
- **Technology**: AWS EventBridge
- **Responsibilities**:
  - Daily concert data refresh
  - Weekly inactive user cleanup
  - Monthly usage reports

#### AI Layer (Phase 3)
- **Technology**: AWS Bedrock (Claude or similar)
- **Responsibilities**:
  - Concert recommendations
  - Similar artist discovery
  - Natural language explanations

---

## Technology Stack Details

### Frontend Technologies

#### React (v18+)
**Purpose**: UI framework
**Why**: Component-based architecture, large ecosystem, excellent documentation
**Alternatives considered**: Vue.js, Svelte

#### Vite
**Purpose**: Build tool and dev server
**Why**: Extremely fast hot module replacement, modern ESM-based architecture
**Alternatives considered**: Create React App, Webpack

#### Tailwind CSS
**Purpose**: Styling
**Why**: Utility-first approach, rapid development, consistent design system
**Alternatives considered**: Material-UI, Chakra UI

#### React Router
**Purpose**: Client-side routing
**Why**: Industry standard for React applications

#### Axios
**Purpose**: HTTP client
**Why**: Better error handling than fetch, request/response interceptors

#### Zustand (or React Context)
**Purpose**: State management
**Why**: Simple, lightweight, minimal boilerplate
**Alternatives considered**: Redux, Jotai

### Backend Technologies

#### AWS Lambda
**Purpose**: Serverless compute
**Why**:
- Pay only for what you use
- Auto-scaling
- No server management
- Integrates seamlessly with API Gateway
**Cost**: ~$0.20 per 1 million requests (first 1M free)

#### Node.js 18
**Purpose**: Lambda runtime
**Why**: JavaScript full-stack, large package ecosystem, fast execution
**Alternatives considered**: Python 3.11 (may use for data processing)

#### API Gateway
**Purpose**: API management
**Why**:
- Built-in request validation
- Cognito integration
- Rate limiting and throttling
- API versioning
**Cost**: $3.50 per million requests (first 1M free)

### Database

#### DynamoDB
**Purpose**: Primary database
**Why**:
- Serverless (no capacity planning)
- Single-digit millisecond latency
- Auto-scaling
- Free tier: 25GB storage, 25 read/write capacity units
**Cost**: ~$0.25 per GB/month for on-demand pricing

**Schema Design** (detailed in DATA_MODELS.md):
- Single-table design pattern
- Partition keys: userId, concertId
- Sort keys for efficient queries
- GSIs (Global Secondary Indexes) for alternate access patterns

### Authentication

#### AWS Cognito
**Purpose**: User authentication and authorization
**Why**:
- Managed service (no security maintenance)
- OAuth 2.0 support for Spotify
- JWT tokens
- Password policies and MFA support
**Cost**: Free for first 50,000 MAU (Monthly Active Users)

### External APIs

#### Music Streaming APIs (Future Enhancement)
**Purpose**: Optional automatic artist import
**Options**:
- Spotify Web API (Free, OAuth 2.0)
- Apple Music API (Requires $99/year Apple Developer Program)
**Status**: Not implemented in MVP - users manually add artists instead
**Cost**: Free (Spotify) or $99/year (Apple Music)

#### Ticketmaster Discovery API
**Purpose**: Concert and event data
**Documentation**: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
**Rate Limits**: 5,000 API calls per day (free tier)
**Features**:
- Event search by artist
- Venue information
- Ticket availability
- Price ranges
**Cost**: Free tier available

#### Alternative: Songkick API
**Purpose**: Backup concert data source
**Why**: More comprehensive for indie/smaller artists
**Rate Limits**: Varies by partnership level

### Notifications

#### AWS SES (Simple Email Service)
**Purpose**: Email delivery
**Cost**: $0.10 per 1,000 emails
**Features**: Templates, bounce handling, analytics

#### AWS SNS (Simple Notification Service)
**Purpose**: SMS delivery (Phase 2)
**Cost**: $0.00645 per SMS (US)

### Infrastructure as Code

#### AWS CloudFormation
**Purpose**: Infrastructure provisioning
**Why**: Native AWS service, version controlled, repeatable deployments
**Alternatives considered**: Terraform, AWS CDK

#### AWS SAM (Serverless Application Model)
**Purpose**: Simplified Lambda deployment
**Why**: Extensions to CloudFormation specifically for serverless apps

---

## Data Flow

### User Registration Flow

```
1. User fills registration form
   ↓
2. Frontend → Cognito.signUp(email, password)
   ↓
3. Cognito sends verification email
   ↓
4. User clicks verification link
   ↓
5. Frontend → Cognito.confirmSignUp(code)
   ↓
6. User redirected to login
```

### Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend → Cognito.signIn(email, password)
   ↓
3. Cognito validates credentials
   ↓
4. Cognito returns JWT tokens (ID, Access, Refresh)
   ↓
5. Frontend stores tokens in localStorage
   ↓
6. Frontend includes ID token in API requests
   ↓
7. API Gateway validates token with Cognito
   ↓
8. Lambda receives userId in event.requestContext.authorizer.claims
```

### Artist Management Flow

```
1. User clicks "Add Artist"
   ↓
2. User searches for artist name
   ↓
3. Frontend → GET /api/v1/artists/search?q={artistName}
   ↓
4. Lambda queries Ticketmaster API for artist matches
   ↓
5. Frontend displays matching artists
   ↓
6. User selects artist to track
   ↓
7. Frontend → POST /api/v1/artists
   ↓
8. Lambda stores artist in UserArtists table
   ↓
9. Lambda triggers concert search for new artist
   ↓
10. Frontend updates tracked artists list
```

### Concert Discovery Flow

```
Daily at 2 AM MT:
1. EventBridge triggers Concert Refresh Lambda
   ↓
2. Lambda queries all unique artists from UserArtists table
   ↓
3. For each artist:
   a. Query Ticketmaster API for Denver events
   b. Parse and normalize event data
   c. Check if concert already exists in DB
   d. If new, insert into Concerts table
   e. If updated, update Concerts table
   ↓
4. For each new concert:
   a. Find all users who follow that artist
   b. Check if notification already sent
   c. Create notification record
   d. Trigger notification Lambda
   ↓
5. Notification Lambda:
   a. Format email with concert details
   b. Send via SES
   c. Mark notification as sent
```

### User Dashboard Load Flow

```
1. User visits dashboard
   ↓
2. Frontend validates JWT token
   ↓
3. Frontend → GET /api/v1/concerts?upcoming=true
   ↓
4. API Gateway validates token
   ↓
5. Lambda:
   a. Extract userId from token
   b. Query UserArtists for user's artists
   c. Query Concerts for those artists in Denver
   d. Filter to future dates
   e. Sort by date ascending
   f. Return concert list
   ↓
6. Frontend renders concert cards
```

### AI Recommendation Flow (Phase 3)

```
1. User clicks "Discover Concerts"
   ↓
2. Frontend → POST /api/v1/recommendations
   ↓
3. Lambda:
   a. Get user's top artists and genres from Spotify
   b. Get user's concert attendance history (if available)
   c. Query all upcoming Denver concerts
   d. Construct prompt for AI:
      "User likes: [artists/genres]
       Available concerts: [concert list]
       Recommend 5 concerts with explanations"
   e. Call AWS Bedrock API
   f. Parse AI response
   g. Enrich with concert details
   h. Return recommendations
   ↓
4. Frontend displays recommendation cards with AI explanations
```

---

## Security & Authentication

### Authentication Strategy

We're using **AWS Cognito** with **JWT tokens** for authentication:

1. **User Registration**:
   - Email/password stored in Cognito (not in our database)
   - Email verification required
   - Password requirements: min 8 chars, uppercase, lowercase, number

2. **Login**:
   - Cognito validates credentials
   - Returns three JWT tokens:
     - **ID Token**: Contains user identity claims (userId, email)
     - **Access Token**: Used to access user data in Cognito
     - **Refresh Token**: Long-lived token to get new ID/Access tokens

3. **API Authorization**:
   - API Gateway uses Cognito authorizer
   - Validates JWT signature and expiration
   - Passes user claims to Lambda

4. **Token Storage**:
   - Frontend stores tokens in `localStorage` (acceptable for MVP)
   - Consider `httpOnly` cookies for production

### Artist Data Management

For the MVP, artists are managed manually:

1. **Artist Search**:
   - Query Ticketmaster API for artist name matches
   - Return standardized artist data
   - Cache results to minimize API calls

2. **Artist Storage**:
   - Store in UserArtists DynamoDB table
   - Include: userId, artistId, artistName, dateAdded
   - Index by userId for efficient queries

3. **Artist Validation**:
   - Verify artist exists in Ticketmaster database
   - Prevent duplicate artists per user
   - Handle artist name variations

4. **Future Enhancement**:
   - Add OAuth integration for Spotify/Apple Music
   - Implement bulk artist import
   - Store encrypted service tokens in DynamoDB

### API Security

1. **HTTPS Only**: All communication over TLS 1.2+
2. **CORS**: Restrict to frontend domain only
3. **Rate Limiting**: API Gateway throttling (10,000 requests/second)
4. **Input Validation**: Validate all inputs before processing
5. **SQL Injection**: Not applicable (using DynamoDB)
6. **XSS Prevention**: React automatically escapes content
7. **CSRF**: Not needed (using JWT tokens, not cookies)

### Data Protection

1. **Encryption at Rest**:
   - DynamoDB encryption enabled by default (AWS managed keys)
   - S3 bucket encryption enabled

2. **Encryption in Transit**:
   - All API calls over HTTPS
   - TLS 1.2+ required

3. **Secrets Management**:
   - Spotify client secret → AWS Secrets Manager
   - API keys → AWS Secrets Manager or Parameter Store
   - Never commit secrets to Git

4. **Personal Data**:
   - Store minimal user data (email, userId, tracked artists)
   - No sensitive data logged
   - User data isolated by userId

### Compliance Considerations

- **GDPR**: Allow users to export/delete their data
- **CCPA**: Provide data access and deletion capabilities
- **Ticketmaster ToS**: Comply with API usage terms

---

## External API Integrations

### Music Streaming APIs (Future Enhancement)

**Status**: Not implemented in MVP

For future versions, we may add optional integration with:
- **Spotify Web API**: OAuth 2.0, free tier
- **Apple Music API**: JWT-based auth, requires Apple Developer Program ($99/year)

**Purpose**: Allow users to quickly import their favorite artists instead of manual entry

**MVP Approach**: Users manually add artists via search interface

### Ticketmaster Discovery API

#### Authentication
- **Type**: API Key
- **Header**: None (query parameter)

#### Key Endpoints

**Search Events**
```
GET https://app.ticketmaster.com/discovery/v2/events.json?
    keyword={artist_name}&
    city=Denver&
    stateCode=CO&
    classificationName=music&
    apikey={api_key}

Response:
{
  "_embedded": {
    "events": [
      {
        "name": "Concert Name",
        "id": "event_id",
        "dates": {
          "start": {
            "localDate": "2025-06-15",
            "localTime": "20:00:00"
          }
        },
        "_embedded": {
          "venues": [{
            "name": "Red Rocks Amphitheatre",
            "city": { "name": "Morrison" },
            "state": { "stateCode": "CO" }
          }]
        },
        "priceRanges": [{
          "min": 45.00,
          "max": 125.00,
          "currency": "USD"
        }],
        "url": "ticketmaster_link"
      }
    ]
  },
  "page": { "totalElements": 5 }
}
```

#### Rate Limiting
- **Free Tier**: 5,000 requests/day
- **Strategy**:
  - Cache concert data for 24 hours
  - Batch artist searches
  - With 1000 users and 50 artists each, we need smart deduplication

#### Denver Metro Area Venues
Major venues to target:
- Red Rocks Amphitheatre (Morrison)
- Ball Arena (Denver)
- Fillmore Auditorium (Denver)
- Ogden Theatre (Denver)
- Gothic Theatre (Englewood)
- Bluebird Theater (Denver)
- Summit Music Hall (Denver)
- Levitt Pavilion (Denver)

---

## AWS Services Configuration

### Cognito User Pool

```yaml
UserPool:
  Properties:
    UserPoolName: concert-finder-users
    UsernameAttributes:
      - email
    AutoVerifiedAttributes:
      - email
    Policies:
      PasswordPolicy:
        MinimumLength: 8
        RequireUppercase: true
        RequireLowercase: true
        RequireNumbers: true
        RequireSymbols: false
    Schema:
      - Name: email
        Required: true
        Mutable: false
    EmailConfiguration:
      EmailSendingAccount: COGNITO_DEFAULT
```

### DynamoDB Tables

See DATA_MODELS.md for detailed schemas.

**Configuration**:
- **Billing Mode**: On-Demand (pay per request)
  - Why: Unpredictable traffic patterns, cost-effective for small scale
  - Alternative: Provisioned (if we can predict capacity)
- **Encryption**: AWS managed keys
- **Point-in-Time Recovery**: Enabled
- **Backups**: Daily automated backups (7-day retention)

### Lambda Functions

**Runtime**: Node.js 18.x
**Memory**: 512 MB (adjust based on profiling)
**Timeout**: 30 seconds (API calls), 300 seconds (background jobs)
**Environment Variables**:
```
SPOTIFY_CLIENT_ID=from_secrets_manager
TICKETMASTER_API_KEY=from_secrets_manager
REGION=us-west-2
USERS_TABLE=concert-finder-users
CONCERTS_TABLE=concert-finder-concerts
```

**IAM Permissions** (Principle of Least Privilege):
- DynamoDB: Read/Write specific tables only
- Secrets Manager: Read specific secrets only
- SES: SendEmail only
- SNS: Publish only

### API Gateway

**Type**: REST API (not HTTP API)
**Why**: More features (Cognito authorizer, request validation)

**Configuration**:
```yaml
Authorizer:
  Type: COGNITO_USER_POOLS
  ProviderARNs:
    - !GetAtt UserPool.Arn

Throttling:
  RateLimit: 1000 requests/second
  BurstLimit: 2000 requests/second

CORS:
  AllowOrigins:
    - https://your-domain.com
  AllowMethods:
    - GET
    - POST
    - PUT
    - DELETE
  AllowHeaders:
    - Content-Type
    - Authorization
```

### S3 + CloudFront

**S3 Bucket**:
- Static website hosting enabled
- Public read access (for website)
- Versioning enabled
- Lifecycle policy: Delete old versions after 30 days

**CloudFront Distribution**:
- Origin: S3 bucket
- HTTPS only (redirect HTTP)
- Caching: Cache static assets, TTL 1 day
- Geographic restrictions: None
- Custom domain (future): concerts.yourdomain.com

### EventBridge Rules

**Daily Concert Refresh**:
```yaml
Schedule: cron(0 9 * * ? *)  # 2 AM MT (9 AM UTC)
Target: ConcertRefreshLambda
```

**Weekly Cleanup**:
```yaml
Schedule: cron(0 10 ? * SUN *)  # Sunday 3 AM MT
Target: CleanupLambda
```

### SES Configuration

**Verify Domain** (or use email address for testing):
- Verify `noreply@your-domain.com`
- Set up DKIM for deliverability
- Configure SNS topic for bounces/complaints

**Email Templates**:
- New concert notification
- Weekly digest
- Account verification

---

## Performance & Scalability

### Expected Load (Year 1)

- **Users**: 1,000 active users
- **API Requests**: ~50,000/day (50 per user)
- **Database Records**:
  - Users: 1,000
  - Concerts: ~10,000 (Denver area)
  - UserArtists: ~50,000 (50 artists per user)
  - Notifications: ~100,000/year

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard Load Time | < 2 seconds | CloudWatch RUM |
| API Response Time (p95) | < 1 second | CloudWatch Logs |
| Concert Refresh Job | < 5 minutes | Lambda duration |
| Database Query Latency | < 100ms | DynamoDB metrics |

### Optimization Strategies

1. **Frontend**:
   - Code splitting (lazy load routes)
   - Image optimization (WebP format)
   - Minification and compression (Vite)
   - CloudFront caching

2. **API**:
   - Lambda function reuse (keep warm)
   - Connection pooling (DynamoDB)
   - Response compression
   - Pagination for large result sets

3. **Database**:
   - Efficient query patterns (single-table design)
   - Global Secondary Indexes for alternate queries
   - DynamoDB DAX (caching layer) if needed
   - Batch operations where possible

4. **External APIs**:
   - Cache Spotify data (24-hour TTL)
   - Cache concert data (24-hour TTL)
   - Batch Ticketmaster requests
   - Respect rate limits with exponential backoff

### Scalability Considerations

- **Lambda**: Auto-scales to 1,000 concurrent executions (default)
- **API Gateway**: Handles 10,000 requests/second (throttling limit)
- **DynamoDB**: On-demand mode auto-scales
- **S3/CloudFront**: Virtually unlimited

**Bottlenecks to Monitor**:
1. Ticketmaster API rate limit (5,000/day)
   - Solution: Cache aggressively, use multiple API keys if needed
2. Lambda concurrent execution limit
   - Solution: Request limit increase from AWS
3. DynamoDB hot partitions
   - Solution: Ensure even partition key distribution

---

## Cost Estimation

### Monthly Cost Breakdown (1,000 active users)

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda** | 1.5M requests, 512MB, 1s avg | $0.50 |
| **API Gateway** | 1.5M requests | $5.25 |
| **DynamoDB** | 1M reads, 100K writes, 5GB storage | $1.50 |
| **S3** | 10GB storage, 100K requests | $0.50 |
| **CloudFront** | 50GB transfer | $4.25 |
| **Cognito** | 1,000 MAU | Free |
| **SES** | 10,000 emails | $1.00 |
| **EventBridge** | 60 invocations | Free |
| **CloudWatch** | Logs and monitoring | $5.00 |
| **Data Transfer** | Outbound | $2.00 |
| **Total** | | **~$20/month** |

**At 10,000 users**: ~$120/month

### Free Tier Benefits (First 12 months)

- Lambda: 1M requests/month free
- API Gateway: 1M requests/month free
- DynamoDB: 25GB storage, 25 WCU, 25 RCU free
- CloudFront: 50GB transfer free
- SES: 62,000 emails/month free (if sending from EC2)

**Estimated cost during free tier**: < $10/month

### Cost Optimization Strategies

1. Use on-demand DynamoDB (pay only for what you use)
2. Implement aggressive caching to reduce API calls
3. Right-size Lambda memory allocation
4. Use CloudWatch log retention policies (7 days for debug logs)
5. Compress responses to reduce data transfer

---

## Development Phases

### Phase 1: Foundation & Specifications (Weeks 1-2)

**Goal**: Complete planning and set up development environment

**Deliverables**:
- ✅ All specification documents
- ✅ Project structure created
- [ ] AWS account configured
- [ ] Ticketmaster API key obtained
- [ ] Development environment set up (Node.js, AWS CLI, etc.)
- [ ] GitHub repository created and configured

**Success Criteria**:
- Can run a "Hello World" Lambda locally
- Can deploy a simple CloudFormation stack
- Can query Ticketmaster API successfully

---

### Phase 2: MVP Development (Weeks 3-6)

**Goal**: Build a working application with core features

**Week 3: Authentication & Infrastructure**
- [ ] Create CloudFormation templates for core services
- [ ] Deploy Cognito User Pool
- [ ] Build registration/login UI
- [ ] Implement authentication flow
- [ ] Set up API Gateway with Cognito authorizer

**Week 4: Artist Management**
- [ ] Build artist search endpoint (Ticketmaster API)
- [ ] Create "Add Artist" UI with search
- [ ] Build Lambda to add/remove artists
- [ ] Create tracked artists list view
- [ ] Implement artist validation

**Week 5: Concert Discovery**
- [ ] Build Ticketmaster integration Lambda
- [ ] Implement concert search and caching
- [ ] Create DynamoDB schema for concerts
- [ ] Build scheduled job for daily concert refresh
- [ ] Create concert dashboard UI

**Week 6: Notifications & Polish**
- [ ] Implement email notifications (SES)
- [ ] Build notification preferences UI
- [ ] Add concert filtering and sorting
- [ ] Error handling and loading states
- [ ] Initial testing and bug fixes

**Success Criteria**:
- Users can sign up and log in
- Users can manually add and remove favorite artists
- Users can see upcoming Denver concerts for their tracked artists
- Users receive email when tracked artists announce shows

---

### Phase 3: Enhanced Features (Weeks 7-8)

**Goal**: Improve user experience and add requested features

**Week 7**:
- [ ] SMS notifications via SNS
- [ ] User preferences page (venue preferences, price alerts)
- [ ] Calendar export (iCal format)
- [ ] Ticket links and pricing display

**Week 8**:
- [ ] Performance optimization
- [ ] UI/UX improvements based on testing
- [ ] Mobile responsiveness
- [ ] Additional error handling

**Success Criteria**:
- Users can configure notification preferences
- Users can export concerts to calendar
- App works well on mobile devices

---

### Phase 4: AI Features (Weeks 9-12)

**Goal**: Add AI-powered recommendations

**Week 9-10**:
- [ ] Set up AWS Bedrock
- [ ] Build recommendation algorithm
- [ ] Create prompt engineering for concert suggestions
- [ ] Implement similar artist discovery

**Week 11-12**:
- [ ] Build recommendations UI
- [ ] Add feedback mechanism
- [ ] Fine-tune recommendation quality
- [ ] A/B test different recommendation strategies

**Success Criteria**:
- Users receive relevant concert recommendations
- Recommendations include clear explanations
- Users discover new artists they enjoy

---

### Phase 5: Launch Preparation (Weeks 13-14)

**Goal**: Prepare for public launch

**Week 13**:
- [ ] Security audit
- [ ] Performance testing and optimization
- [ ] User acceptance testing
- [ ] Bug fixes
- [ ] Documentation finalization

**Week 14**:
- [ ] Set up monitoring and alerts
- [ ] Create launch plan
- [ ] Soft launch with small user group
- [ ] Gather feedback and iterate
- [ ] Public launch

**Success Criteria**:
- All critical bugs fixed
- Performance targets met
- Security best practices implemented
- Documentation complete

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Ticketmaster API rate limit exceeded | Medium | High | Cache aggressively, use multiple keys if needed |
| Spotify API changes | Low | Medium | Monitor API changelog, version our integration |
| AWS costs exceed budget | Medium | Medium | Set up billing alerts, use cost optimization |
| Low concert availability in Denver | Low | High | Expand to nearby cities (Boulder, Colorado Springs) |
| Poor AI recommendation quality | Medium | Medium | Implement feedback loop, refine prompts |
| Security vulnerability | Low | High | Follow OWASP guidelines, regular security audits |

---

## Future Enhancements (Post-Launch)

1. **Geographic Expansion**
   - Support multiple cities
   - User-selectable location
   - Distance-based filtering

2. **Social Features**
   - Friend recommendations
   - Group concert planning
   - Share concert lists

3. **Advanced Notifications**
   - Push notifications (web push)
   - Custom notification schedules
   - Price drop alerts

4. **Analytics**
   - User listening trend analysis
   - Concert attendance history
   - Genre discovery over time

5. **Mobile App**
   - Native iOS/Android apps
   - Offline support
   - Location-based notifications

6. **Premium Features**
   - Ad-free experience
   - Early concert notifications
   - VIP ticket access
   - Exclusive content

---

## Conclusion

This specification provides a comprehensive blueprint for building Concert Finder. The architecture is designed to be:

- **Scalable**: Serverless components auto-scale with demand
- **Cost-effective**: Pay only for what you use, leverage free tiers
- **Maintainable**: Infrastructure as code, well-documented
- **Secure**: Industry best practices, encrypted data
- **User-focused**: Solves real problems for music lovers

Next steps:
1. Review and approve this specification
2. Set up AWS account and development environment (see SETUP_GUIDE.md)
3. Begin Phase 1 development
4. Iterate based on user feedback

Questions or suggestions? Open an issue on GitHub or contact the development team.

---

**Document Status**: Draft - Pending Review
**Version**: 1.0
**Last Updated**: 2025-11-09
