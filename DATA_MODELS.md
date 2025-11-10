# Data Models & Database Schema

## Document Overview

This document defines the database schema and data models for Concert Finder using Amazon DynamoDB. We're using a **single-table design** pattern, which is a DynamoDB best practice for optimal performance and cost efficiency.

**Version**: 1.0
**Last Updated**: 2025-11-09
**Database**: Amazon DynamoDB

---

## Table of Contents

1. [DynamoDB Overview](#dynamodb-overview)
2. [Single-Table Design Pattern](#single-table-design-pattern)
3. [Main Table Schema](#main-table-schema)
4. [Access Patterns](#access-patterns)
5. [Entity Schemas](#entity-schemas)
6. [Global Secondary Indexes](#global-secondary-indexes)
7. [Sample Data](#sample-data)
8. [Migration Strategy](#migration-strategy)

---

## DynamoDB Overview

### Why DynamoDB?

DynamoDB is AWS's fully managed NoSQL database service with the following benefits:

- **Serverless**: No servers to manage, auto-scaling
- **Fast**: Single-digit millisecond latency
- **Scalable**: Handles any amount of traffic
- **Cost-effective**: Pay only for what you use
- **Reliable**: 99.99% availability SLA

### Key Concepts

#### Primary Key
Every item must have a unique primary key consisting of:
- **Partition Key (PK)**: Determines which partition stores the item
- **Sort Key (SK)** (optional): Enables sorting and range queries within a partition

#### Attributes
- Flexible schema - different items can have different attributes
- Attribute types: String, Number, Binary, Boolean, List, Map, Set

#### Global Secondary Index (GSI)
- Alternate key structure for different query patterns
- Has its own partition key and sort key
- Eventually consistent with the main table

### DynamoDB vs Relational Databases

| Relational DB | DynamoDB |
|---------------|----------|
| Fixed schema | Flexible schema |
| JOIN operations | Denormalized data |
| Multiple tables | Single table (best practice) |
| Normalized data | Duplicate data for performance |
| Query by any column (slow) | Query by primary key (fast) |

---

## Single-Table Design Pattern

### What is Single-Table Design?

Instead of creating separate tables for Users, Concerts, Artists, etc., we store **all entities in one table** using clever key design. This approach:

✅ **Reduces costs** (fewer tables to manage)
✅ **Improves performance** (related data in same partition)
✅ **Simplifies transactions** (all data in one table)
✅ **Enables batch operations** (query multiple entity types together)

### How It Works

We use prefixes in our keys to differentiate entity types:

```
PK (Partition Key)        SK (Sort Key)           Entity Type
USER#123                 PROFILE                  User profile
USER#123                 ARTIST#tm:K8vZ917Gku7    User's tracked artist
USER#123                 NOTIF#2025-01-15#001     User's notification
CONCERT#abc123           METADATA                 Concert details
ARTIST#tm:K8vZ917Gku7    CONCERT#2025-07-15       Artist's upcoming concert
```

---

## Main Table Schema

### Table Name
`concert-finder-main`

### Primary Key Structure

| Attribute | Type | Description |
|-----------|------|-------------|
| **PK** | String | Partition Key - Entity identifier |
| **SK** | String | Sort Key - Entity type or relationship |
| **GSI1PK** | String | Global Secondary Index 1 Partition Key |
| **GSI1SK** | String | Global Secondary Index 1 Sort Key |
| **GSI2PK** | String | Global Secondary Index 2 Partition Key (Phase 2) |
| **GSI2SK** | String | Global Secondary Index 2 Sort Key (Phase 2) |

### Table Configuration

```yaml
TableName: concert-finder-main
BillingMode: PAY_PER_REQUEST  # On-demand pricing
PointInTimeRecoveryEnabled: true
DeletionProtectionEnabled: true (production)
Encryption:
  SSEEnabled: true
  SSEType: KMS
  KMSMasterKeyId: AWS_MANAGED_KEY
Tags:
  - Key: Environment
    Value: production
  - Key: Application
    Value: concert-finder
```

---

## Access Patterns

### User-Related Access Patterns

| Access Pattern | Key Condition |
|----------------|---------------|
| **AP1**: Get user profile | `PK = USER#{userId} AND SK = PROFILE` |
| **AP2**: Get user's artists | `PK = USER#{userId} AND begins_with(SK, 'ARTIST#')` |
| **AP3**: Get user's notifications | `PK = USER#{userId} AND begins_with(SK, 'NOTIF#')` |
| **AP4**: Get user's preferences | `PK = USER#{userId} AND SK = PREFERENCES` |

### Concert-Related Access Patterns

| Access Pattern | Key Condition |
|----------------|---------------|
| **AP5**: Get concert details | `PK = CONCERT#{concertId} AND SK = METADATA` |
| **AP6**: Get concerts by artist | `GSI1PK = ARTIST#{artistId} AND begins_with(GSI1SK, 'CONCERT#')` |
| **AP7**: Get concerts by date range | `GSI1PK = CITY#Denver AND GSI1SK BETWEEN date1 AND date2` |
| **AP8**: Get user's upcoming concerts | Query user's artists, then batch get concerts |

### Artist-Related Access Patterns

| Access Pattern | Key Condition |
|----------------|---------------|
| **AP9**: Get artist details | `PK = ARTIST#{artistId} AND SK = METADATA` |
| **AP10**: Get users following artist | `GSI1PK = ARTIST#{artistId} AND begins_with(GSI1SK, 'USER#')` |
| **AP11**: Get artist's concerts | `PK = ARTIST#{artistId} AND begins_with(SK, 'CONCERT#')` |

### Notification-Related Access Patterns

| Access Pattern | Key Condition |
|----------------|---------------|
| **AP12**: Get unread notifications | `PK = USER#{userId} AND begins_with(SK, 'NOTIF#') AND readStatus = false` (filter) |
| **AP13**: Get notification by ID | `GSI2PK = NOTIF#{notificationId} AND SK = METADATA` |

---

## Entity Schemas

### 1. User Profile

**PK**: `USER#{userId}`
**SK**: `PROFILE`

```json
{
  "PK": "USER#123e4567-e89b-12d3-a456-426614174000",
  "SK": "PROFILE",
  "EntityType": "UserProfile",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z",
  "statistics": {
    "totalArtistsTracked": 47,
    "upcomingConcerts": 12,
    "concertsAttended": 0,
    "notificationsSent": 25
  },
  "settings": {
    "theme": "light",
    "emailVerified": true
  }
}
```

### 2. User Preferences

**PK**: `USER#{userId}`
**SK**: `PREFERENCES`

```json
{
  "PK": "USER#123e4567-e89b-12d3-a456-426614174000",
  "SK": "PREFERENCES",
  "EntityType": "UserPreferences",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "notifications": {
    "email": true,
    "sms": false,
    "push": false,
    "frequency": "immediate",
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00",
      "timezone": "America/Denver"
    }
  },
  "location": {
    "city": "Denver",
    "state": "CO",
    "radius": 50,
    "includeNearbyCities": true,
    "nearbyCities": ["Boulder", "Colorado Springs"]
  },
  "filters": {
    "minPrice": 0,
    "maxPrice": 150,
    "preferredVenues": [
      "Red Rocks Amphitheatre",
      "Ball Arena",
      "Fillmore Auditorium"
    ],
    "excludedVenues": [],
    "preferredDays": ["Friday", "Saturday"],
    "genres": []
  },
  "updatedAt": "2025-01-20T14:30:00Z"
}
```

### 3. User-Artist Relationship

**PK**: `USER#{userId}`
**SK**: `ARTIST#{artistId}`
**GSI1PK**: `ARTIST#{artistId}`
**GSI1SK**: `USER#{userId}`

```json
{
  "PK": "USER#123e4567-e89b-12d3-a456-426614174000",
  "SK": "ARTIST#tm:K8vZ917Gku7",
  "GSI1PK": "ARTIST#tm:K8vZ917Gku7",
  "GSI1SK": "USER#123e4567-e89b-12d3-a456-426614174000",
  "EntityType": "UserArtist",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "artistId": "tm:K8vZ917Gku7",
  "artistName": "The Lumineers",
  "artistImageUrl": "https://s1.ticketm.net/dam/a/abc/123.jpg",
  "genres": ["Folk", "Indie"],
  "addedAt": "2025-01-15T11:00:00Z",
  "addedBy": "manual",
  "notificationsEnabled": true
}
```

**Note**: Artists are added manually by users via search (Ticketmaster API). The `addedBy` field is "manual" for MVP. Future versions may support "spotify_import" or "applemusic_import".

### 4. Concert

**PK**: `CONCERT#{concertId}`
**SK**: `METADATA`
**GSI1PK**: `ARTIST#{artistId}`
**GSI1SK**: `CONCERT#{date}`
**GSI2PK**: `CITY#{city}`
**GSI2SK**: `DATE#{date}`

```json
{
  "PK": "CONCERT#abc123",
  "SK": "METADATA",
  "GSI1PK": "ARTIST#tm:K8vZ917Gku7",
  "GSI1SK": "CONCERT#2025-07-15",
  "GSI2PK": "CITY#Denver",
  "GSI2SK": "DATE#2025-07-15",
  "EntityType": "Concert",
  "concertId": "abc123",
  "artist": {
    "id": "tm:K8vZ917Gku7",
    "name": "The Lumineers",
    "imageUrl": "https://s1.ticketm.net/dam/a/abc/123.jpg"
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
    "capacity": 9525
  },
  "tickets": {
    "available": true,
    "priceRange": {
      "min": 65.00,
      "max": 125.00,
      "currency": "USD"
    },
    "purchaseUrl": "https://www.ticketmaster.com/event/abc123",
    "salesStart": "2025-02-01T10:00:00Z",
    "salesEnd": "2025-07-15T18:00:00Z"
  },
  "lineup": {
    "headliner": "The Lumineers",
    "supportingActs": ["James Bay"]
  },
  "metadata": {
    "addedAt": "2025-02-01T10:00:00Z",
    "source": "ticketmaster",
    "sourceId": "tm-event-123",
    "lastUpdated": "2025-02-01T10:00:00Z"
  },
  "searchableText": "the lumineers summer tour red rocks amphitheatre denver folk indie"
}
```

### 5. Artist Metadata

**PK**: `ARTIST#{artistId}`
**SK**: `METADATA`

```json
{
  "PK": "ARTIST#tm:K8vZ917Gku7",
  "SK": "METADATA",
  "EntityType": "Artist",
  "artistId": "tm:K8vZ917Gku7",
  "name": "The Lumineers",
  "imageUrl": "https://s1.ticketm.net/dam/a/abc/123.jpg",
  "genres": ["Folk", "Indie", "Americana"],
  "ticketmasterUrl": "https://www.ticketmaster.com/the-lumineers-tickets/artist/K8vZ917Gku7",
  "bio": "The Lumineers are an American folk rock band...",
  "statistics": {
    "totalTrackers": 234,
    "upcomingConcerts": 12,
    "lastConcertDate": "2025-07-15"
  },
  "metadata": {
    "firstSeen": "2025-01-15T11:00:00Z",
    "lastUpdated": "2025-02-01T10:00:00Z",
    "source": "ticketmaster"
  }
}
```

**Note**: Artist metadata is cached from Ticketmaster API to reduce API calls. Updated when users add the artist or during scheduled refreshes.

### 6. Notification

**PK**: `USER#{userId}`
**SK**: `NOTIF#{timestamp}#{notificationId}`
**GSI1PK**: `NOTIF#{notificationId}`
**GSI1SK**: `METADATA`

```json
{
  "PK": "USER#123e4567-e89b-12d3-a456-426614174000",
  "SK": "NOTIF#2025-02-01T10:05:00Z#notif-abc123",
  "GSI1PK": "NOTIF#notif-abc123",
  "GSI1SK": "METADATA",
  "EntityType": "Notification",
  "notificationId": "notif-abc123",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "concert_announced",
  "title": "The Lumineers announced a Denver show!",
  "message": "The Lumineers will be performing at Red Rocks on July 15, 2025.",
  "data": {
    "concertId": "concert-abc123",
    "artistId": "tm:K8vZ917Gku7",
    "artistName": "The Lumineers",
    "venue": "Red Rocks Amphitheatre",
    "date": "2025-07-15"
  },
  "channels": {
    "email": {
      "sent": true,
      "sentAt": "2025-02-01T10:05:00Z",
      "messageId": "ses-msg-123"
    },
    "sms": {
      "sent": false
    },
    "push": {
      "sent": false
    }
  },
  "read": false,
  "readAt": null,
  "createdAt": "2025-02-01T10:05:00Z",
  "TTL": 1741910700
}
```

**Note**: Notifications have a TTL (Time To Live) of 90 days and are automatically deleted.

### 8. Recommendation (Phase 3)

**PK**: `USER#{userId}`
**SK**: `RECOMMEND#{timestamp}#{concertId}`

```json
{
  "PK": "USER#123e4567-e89b-12d3-a456-426614174000",
  "SK": "RECOMMEND#2025-11-09T13:30:00Z#concert-xyz789",
  "EntityType": "Recommendation",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "concertId": "concert-xyz789",
  "score": 0.92,
  "reason": "Based on your love for The Lumineers and Gregory Alan Isakov...",
  "similarToArtists": [
    "The Lumineers",
    "Gregory Alan Isakov"
  ],
  "matchingGenres": ["folk", "indie", "americana"],
  "aiModel": "claude-3-sonnet-20240229",
  "generatedAt": "2025-11-09T13:30:00Z",
  "feedback": {
    "helpful": true,
    "attended": false,
    "comment": "Great recommendation!",
    "submittedAt": "2025-11-10T08:00:00Z"
  },
  "TTL": 1733839800
}
```

---

## Global Secondary Indexes

### GSI1: Artist and City Queries

**Purpose**: Query concerts by artist or by city

**Index Name**: `GSI1`

**Key Schema**:
- **Partition Key**: `GSI1PK` (String)
- **Sort Key**: `GSI1SK` (String)

**Projected Attributes**: ALL

**Use Cases**:
1. Get all concerts for a specific artist: `GSI1PK = ARTIST#{artistId}`
2. Get all users following an artist: `GSI1PK = ARTIST#{artistId} AND begins_with(GSI1SK, 'USER#')`
3. Get concerts in a city by date: `GSI1PK = CITY#{city} AND begins_with(GSI1SK, 'DATE#')`

**Example Queries**:
```python
# Get concerts for The Lumineers
response = table.query(
    IndexName='GSI1',
    KeyConditionExpression='GSI1PK = :artistId AND begins_with(GSI1SK, :prefix)',
    ExpressionAttributeValues={
        ':artistId': 'ARTIST#tm:K8vZ917Gku7',
        ':prefix': 'CONCERT#'
    }
)

# Get all concerts in Denver after June 1, 2025
response = table.query(
    IndexName='GSI1',
    KeyConditionExpression='GSI1PK = :city AND GSI1SK BETWEEN :start AND :end',
    ExpressionAttributeValues={
        ':city': 'CITY#Denver',
        ':start': 'DATE#2025-06-01',
        ':end': 'DATE#2025-12-31'
    }
)
```

### GSI2: Notification Lookups (Optional)

**Purpose**: Look up notifications by ID

**Index Name**: `GSI2`

**Key Schema**:
- **Partition Key**: `GSI2PK` (String)
- **Sort Key**: `GSI2SK` (String)

**Projected Attributes**: ALL

**Use Case**: Get notification details by notification ID

---

## Sample Data

### Sample Database State

Here's what the table looks like with sample data:

| PK | SK | GSI1PK | GSI1SK | EntityType | Other Attributes |
|----|----|--------|--------|------------|-----------------|
| USER#user-123 | PROFILE | - | - | UserProfile | email, createdAt, ... |
| USER#user-123 | PREFERENCES | - | - | UserPreferences | notifications, location, ... |
| USER#user-123 | ARTIST#tm:K8vZ917 | ARTIST#tm:K8vZ917 | USER#user-123 | UserArtist | artistName, addedAt, ... |
| USER#user-123 | ARTIST#tm:abc123 | ARTIST#tm:abc123 | USER#user-123 | UserArtist | artistName, addedAt, ... |
| USER#user-123 | NOTIF#2025-02-01#n1 | NOTIF#n1 | METADATA | Notification | title, message, read, ... |
| CONCERT#c1 | METADATA | ARTIST#tm:K8vZ917 | CONCERT#2025-07-15 | Concert | artist, venue, tickets, ... |
| CONCERT#c1 | METADATA | CITY#Denver | DATE#2025-07-15 | Concert | (GSI2PK, GSI2SK) |
| ARTIST#tm:K8vZ917 | METADATA | - | - | Artist | name, genres, ... |

---

## Query Examples

### 1. Get User's Profile and Preferences

```python
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('concert-finder-main')

# Get user profile
response = table.get_item(
    Key={
        'PK': 'USER#123e4567-e89b-12d3-a456-426614174000',
        'SK': 'PROFILE'
    }
)
user_profile = response['Item']

# Get user preferences
response = table.get_item(
    Key={
        'PK': 'USER#123e4567-e89b-12d3-a456-426614174000',
        'SK': 'PREFERENCES'
    }
)
user_preferences = response['Item']
```

### 2. Get All Artists User Follows

```python
response = table.query(
    KeyConditionExpression=Key('PK').eq('USER#123e4567-e89b-12d3-a456-426614174000') &
                          Key('SK').begins_with('ARTIST#')
)
artists = response['Items']
```

### 3. Get User's Upcoming Concerts

```python
# Step 1: Get user's artists
response = table.query(
    KeyConditionExpression=Key('PK').eq('USER#user-123') &
                          Key('SK').begins_with('ARTIST#')
)
artist_ids = [item['artistId'] for item in response['Items']]

# Step 2: Get concerts for each artist (using GSI1)
all_concerts = []
for artist_id in artist_ids:
    response = table.query(
        IndexName='GSI1',
        KeyConditionExpression=Key('GSI1PK').eq(f'ARTIST#{artist_id}') &
                              Key('GSI1SK').begins_with('CONCERT#')
    )
    all_concerts.extend(response['Items'])

# Step 3: Filter to future dates and sort
from datetime import datetime
today = datetime.now().strftime('%Y-%m-%d')
upcoming_concerts = [c for c in all_concerts if c['event']['date'] >= today]
upcoming_concerts.sort(key=lambda x: x['event']['date'])
```

### 4. Get All Concerts in Denver Between Dates

```python
response = table.query(
    IndexName='GSI1',
    KeyConditionExpression=Key('GSI1PK').eq('CITY#Denver') &
                          Key('GSI1SK').between('DATE#2025-06-01', 'DATE#2025-08-31')
)
concerts = response['Items']
```

### 5. Find Users Who Follow a Specific Artist

```python
# This is used for sending notifications
response = table.query(
    IndexName='GSI1',
    KeyConditionExpression=Key('GSI1PK').eq('ARTIST#tm:K8vZ917Gku7') &
                          Key('GSI1SK').begins_with('USER#')
)
users = response['Items']
```

---

## Data Consistency & Integrity

### DynamoDB Consistency Models

1. **Eventually Consistent Reads** (default):
   - Faster and cheaper
   - May not reflect recent writes
   - Used for GSI queries

2. **Strongly Consistent Reads**:
   - Always reflects recent writes
   - Slower and more expensive
   - Not available for GSIs
   - Use for critical operations

### Atomic Operations

**Conditional Writes** - Prevent race conditions:
```python
# Only update if item hasn't changed
table.update_item(
    Key={'PK': 'USER#123', 'SK': 'PROFILE'},
    UpdateExpression='SET updatedAt = :now',
    ConditionExpression='version = :expected_version',
    ExpressionAttributeValues={
        ':now': current_timestamp,
        ':expected_version': 5
    }
)
```

**Transactions** - Update multiple items atomically:
```python
# Add artist and update user stats in one transaction
dynamodb.transact_write_items(
    TransactItems=[
        {
            'Put': {
                'TableName': 'concert-finder-main',
                'Item': {
                    'PK': 'USER#123',
                    'SK': 'ARTIST#tm:K8vZ917',
                    # ... artist data
                }
            }
        },
        {
            'Update': {
                'TableName': 'concert-finder-main',
                'Key': {'PK': 'USER#123', 'SK': 'PROFILE'},
                'UpdateExpression': 'SET statistics.totalArtistsFollowed = statistics.totalArtistsFollowed + :inc',
                'ExpressionAttributeValues': {':inc': 1}
            }
        }
    ]
)
```

---

## Data Lifecycle & TTL

### Time To Live (TTL)

DynamoDB can automatically delete expired items using the `TTL` attribute:

**Enabled for**:
1. **Music Service Tokens**: Delete 30 days after expiration
2. **Notifications**: Delete 90 days after creation
3. **Recommendations**: Delete 30 days after generation

**Example**:
```python
import time

# Set TTL to 90 days from now
ttl_timestamp = int(time.time()) + (90 * 24 * 60 * 60)

item = {
    'PK': 'USER#123',
    'SK': 'NOTIF#2025-02-01#n1',
    # ... other attributes
    'TTL': ttl_timestamp  # DynamoDB will auto-delete when this time passes
}
```

### Soft Deletes

For important records (concerts, user profiles), use soft deletes:
```python
# Don't actually delete, just mark as deleted
table.update_item(
    Key={'PK': 'CONCERT#abc123', 'SK': 'METADATA'},
    UpdateExpression='SET deleted = :true, deletedAt = :now',
    ExpressionAttributeValues={
        ':true': True,
        ':now': current_timestamp
    }
)
```

---

## Backup & Disaster Recovery

### Point-in-Time Recovery (PITR)

- Enabled for production table
- Continuous backups for 35 days
- Restore to any point in time

### On-Demand Backups

- Manual backups before major changes
- Retained indefinitely until manually deleted
- Can restore to new table

### Cross-Region Replication (Future)

For disaster recovery:
- Replicate table to another AWS region
- Failover if primary region fails

---

## Performance Optimization

### Read/Write Capacity

**On-Demand Mode** (recommended for MVP):
- Pay per request
- Automatically scales
- No capacity planning needed
- Cost: $1.25 per million writes, $0.25 per million reads

**Provisioned Mode** (for predictable traffic):
- Define read/write capacity units
- Auto-scaling enabled
- Reserved capacity for cost savings

### Query Optimization

1. **Use Partition Key Efficiently**:
   - Always include partition key in queries
   - Distribute data across many partitions
   - Avoid "hot partitions" (one partition getting all traffic)

2. **Minimize Item Size**:
   - Keep items under 4KB when possible
   - Larger items consume more capacity
   - Use compression for large text fields

3. **Batch Operations**:
   - `BatchGetItem`: Retrieve up to 100 items in one request
   - `BatchWriteItem`: Write up to 25 items in one request
   - Reduces API calls and improves performance

4. **Projection Expressions**:
   - Only retrieve attributes you need
   - Reduces data transfer and costs

5. **Caching**:
   - Use DynamoDB Accelerator (DAX) for microsecond latency
   - Cache frequently accessed data in Lambda memory
   - Use CloudFront for API responses

---

## Migration Strategy

### Phase 1: Initial Schema

MVP schema with core entities:
- Users, Preferences, Artists, Concerts, Notifications

### Phase 2: Enhanced Features

Add new entity types:
- Concert reviews/ratings
- User concert attendance history
- Favorite venues

### Phase 3: AI Features

Add recommendation entities:
- Recommendations
- User feedback
- AI training data

### Data Migration Process

When schema changes are needed:

1. **Add new attributes** (no migration needed):
   ```python
   # Old items continue to work, new items have extra attributes
   ```

2. **Rename attributes** (requires migration):
   ```python
   # Scan table, update all items
   for item in all_items:
       item['newAttributeName'] = item.pop('oldAttributeName')
       table.put_item(Item=item)
   ```

3. **Change key structure** (requires new table):
   ```python
   # Create new table with new schema
   # Copy data with transformation
   # Switch application to new table
   # Delete old table
   ```

---

## Cost Estimation

### Storage Costs

- **$0.25 per GB/month**
- Estimated data: 5GB (1,000 users, 10,000 concerts)
- **Monthly cost**: $1.25

### Request Costs (On-Demand)

| Operation | Cost per Million | Monthly Requests | Monthly Cost |
|-----------|-----------------|------------------|--------------|
| Write | $1.25 | 100,000 (100/user) | $0.13 |
| Read | $0.25 | 1,000,000 (1,000/user) | $0.25 |
| **Total** | | | **$0.38** |

### Total DynamoDB Cost

**MVP (1,000 users)**: ~$2/month
**At scale (10,000 users)**: ~$15/month

---

## Security Best Practices

### Encryption

1. **At Rest**: AWS managed KMS encryption (default)
2. **In Transit**: All API calls over HTTPS/TLS
3. **Sensitive Data**: Encrypt tokens before storing (application-level)

### Access Control

1. **IAM Policies**: Lambda functions have minimal permissions
2. **VPC Endpoints**: Access DynamoDB without internet (optional)
3. **Audit Logging**: Enable CloudTrail for all DynamoDB operations

### Data Privacy

1. **PII Handling**: Minimal personal data stored
2. **Data Deletion**: Support user data export and deletion (GDPR)
3. **Token Management**: Refresh tokens rotated regularly

---

## Conclusion

This single-table design provides:

✅ **Efficient queries** for all access patterns
✅ **Cost optimization** through denormalization
✅ **Scalability** for millions of users
✅ **Flexibility** to add new features
✅ **Performance** with single-digit millisecond latency

**Next Steps**:
1. Review and approve schema design
2. Create CloudFormation template for table
3. Write helper functions for common queries
4. Implement data access layer (DAL) in backend
5. Add indexes as needed for new features

---

**Document Status**: Draft - Pending Review
**Version**: 1.0
**Last Updated**: 2025-11-09
