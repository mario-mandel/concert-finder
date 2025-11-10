# Key Concepts Explained

## Document Overview

This document explains the key technologies and concepts used in Concert Finder in beginner-friendly language. If you're new to web development, AWS, or building full-stack applications, start here!

---

## Table of Contents

1. [Frontend vs Backend](#frontend-vs-backend)
2. [What is "Serverless"?](#what-is-serverless)
3. [AWS Services Explained](#aws-services-explained)
4. [Authentication & Authorization](#authentication--authorization)
5. [APIs & REST](#apis--rest)
6. [Databases: SQL vs NoSQL](#databases-sql-vs-nosql)
7. [React Concepts](#react-concepts)
8. [Development Workflow](#development-workflow)
9. [Common Terms Glossary](#common-terms-glossary)

---

## Frontend vs Backend

Think of a web application like a restaurant:

### Frontend (The Dining Room)
- What the customer sees and interacts with
- The menu, the tables, the ambiance
- In our app: The website you see in your browser
- Technologies: **React** (JavaScript framework), **HTML**, **CSS**

**Analogy**: The dining room of a restaurant

**What it does in Concert Finder**:
- Displays concert listings
- Shows buttons and forms
- Handles user clicks and interactions
- Makes the app look good

### Backend (The Kitchen)
- Behind-the-scenes processing
- Food preparation, inventory management
- In our app: The server that processes requests
- Technologies: **AWS Lambda** (Node.js functions)

**Analogy**: The kitchen of a restaurant

**What it does in Concert Finder**:
- Fetches concert data from Ticketmaster
- Checks if you're logged in
- Saves your favorite artists
- Sends email notifications

### How They Communicate

Frontend: "Hey backend, show me upcoming concerts for The Lumineers"
Backend: "Here's the data: [concert list]"
Frontend: "Thanks! I'll display these nicely for the user"

This communication happens through **APIs** (explained below).

---

## What is "Serverless"?

### Traditional Applications

**Old way**: You rent a server (a computer in a data center) that runs 24/7:
- You pay for the whole server, even when no one is using your app
- You manage updates, security patches, scaling
- If your app gets popular, you need to buy more servers manually

**Analogy**: Owning a car - you pay for it whether you drive it or not

### Serverless Applications

**New way**: AWS runs your code only when needed:
- You pay only for the exact time your code runs (pennies!)
- AWS handles updates, security, scaling automatically
- If your app gets popular, AWS automatically creates more capacity
- If no one is using it, you pay almost nothing

**Analogy**: Taking an Uber - you pay only for rides you actually take

### Concert Finder is Serverless!

Our app uses:
- **AWS Lambda**: Runs code only when users make requests
- **DynamoDB**: Database that scales automatically
- **API Gateway**: Routes requests to the right code
- **S3**: Hosts frontend files (HTML, CSS, JavaScript)

**Cost**: ~$2-5/month for 1,000 users (vs $100+/month for traditional servers)

---

## AWS Services Explained

### Think of AWS as a Shopping Mall

AWS has 200+ services. We're only using a few:

### 1. AWS Lambda
**What it is**: Run code without managing servers
**Analogy**: Food delivery - you order food (run code), it gets prepared and delivered, you pay only for what you ordered
**Our use**: All backend logic (authentication, fetching concerts, etc.)

**Example**:
```javascript
// A Lambda function that responds to API requests
export const handler = async (event) => {
  // When someone visits /concerts endpoint:
  const concerts = await fetchConcertsFromDatabase();
  return {
    statusCode: 200,
    body: JSON.stringify(concerts)
  };
};
```

### 2. DynamoDB
**What it is**: A NoSQL database (like a super-fast spreadsheet)
**Analogy**: A filing cabinet that instantly finds any document
**Our use**: Store users, concerts, notifications

**Advantages**:
- Extremely fast (millisecond response time)
- Automatically scales to handle any amount of data
- Pay only for what you store and access

### 3. API Gateway
**What it is**: The front door to your backend
**Analogy**: A receptionist who routes calls to the right department
**Our use**: Routes API requests (like GET /concerts) to the right Lambda function

**Example**:
```
GET /concerts → Routes to → GetConcertsLambdaFunction
POST /spotify/connect → Routes to → ConnectSpotifyLambdaFunction
```

### 4. Cognito
**What it is**: User authentication and management
**Analogy**: A security guard who checks IDs and issues visitor badges
**Our use**: Handle user registration, login, password resets

**Why we use it**: Building secure authentication from scratch is extremely difficult and risky. Cognito does it for us with industry best practices.

### 5. S3 (Simple Storage Service)
**What it is**: Cloud storage for files
**Analogy**: Google Drive or Dropbox, but for applications
**Our use**: Host the frontend website files (HTML, CSS, JavaScript)

**How it works**:
1. We build the React app → Creates HTML/CSS/JS files
2. We upload these files to S3
3. S3 serves them to users' browsers
4. CloudFront (a CDN) makes it faster worldwide

### 6. SES (Simple Email Service)
**What it is**: Send emails from your application
**Analogy**: A post office for emails
**Our use**: Send concert notification emails

**Cost**: $0.10 per 1,000 emails (very cheap!)

---

## Authentication & Authorization

These sound similar but mean different things:

### Authentication
**Question**: "Who are you?"
**Process**: Verifying someone's identity
**Example**: Logging in with email and password

**In Concert Finder**:
1. You enter email and password
2. Cognito checks if they match
3. Cognito gives you a **token** (a special key)
4. You use this token for future requests

### Authorization
**Question**: "What are you allowed to do?"
**Process**: Determining permissions
**Example**: Only you can see your concert notifications, not other users'

**In Concert Finder**:
1. You make a request: "Show me my notifications"
2. You include your token
3. Backend checks: "This token belongs to User #123"
4. Backend shows only User #123's notifications, not User #456's

### JWT Tokens

**What they are**: Encoded text that contains user information

**Structure**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
       [Header]                                  [Payload with user data]                    [Signature]
```

**Analogy**: A tamper-proof ID card
- Contains your information
- Can't be faked (cryptographically signed)
- Expires after a certain time (usually 1 hour)

---

## APIs & REST

### What is an API?

**API** = Application Programming Interface

**Analogy**: A waiter at a restaurant
- You (frontend) give your order (request) to the waiter (API)
- Waiter takes it to the kitchen (backend)
- Kitchen prepares food (processes request)
- Waiter brings food back (response)
- You never enter the kitchen directly

### REST API

**REST** = Representational State Transfer (don't worry about the name)

**Key Idea**: Use standard HTTP methods to interact with resources

**Resources** = Things in your app (users, concerts, notifications)

### HTTP Methods (CRUD Operations)

| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Read data | Get list of concerts |
| **POST** | Create data | Create new user account |
| **PUT** | Update entire resource | Update user profile |
| **PATCH** | Update part of resource | Update notification preference |
| **DELETE** | Delete data | Delete notification |

### Example API Request

**Frontend (React) code**:
```javascript
// Get concerts
const response = await fetch('https://api.concert-finder.com/v1/concerts', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const concerts = await response.json();
```

**What happens**:
1. Browser sends GET request to API
2. API Gateway receives it
3. Checks authentication token
4. Runs Lambda function to get concerts
5. Lambda queries DynamoDB
6. Returns concert data as JSON
7. Frontend displays concerts

---

## Databases: SQL vs NoSQL

### SQL Databases (Relational)

**Example**: PostgreSQL, MySQL

**Structure**: Tables with rows and columns (like Excel)

**Example**:
```
Users Table:
| id  | email            | name       |
|-----|------------------|------------|
| 1   | john@example.com | John Doe   |
| 2   | jane@example.com | Jane Smith |

Concerts Table:
| id  | artist_name     | date       | user_id |
|-----|-----------------|------------|---------|
| 101 | The Lumineers   | 2025-07-15 | 1       |
| 102 | Nathaniel Rateliff | 2025-08-20 | 1    |
```

**Characteristics**:
- Fixed schema (structure defined upfront)
- Use SQL language to query
- Relationships between tables (foreign keys)
- ACID transactions (reliable, consistent)

### NoSQL Databases (Non-Relational)

**Example**: DynamoDB, MongoDB

**Structure**: Flexible documents (like JSON objects)

**Example**:
```json
{
  "userId": "123",
  "email": "john@example.com",
  "name": "John Doe",
  "concerts": [
    {"artist": "The Lumineers", "date": "2025-07-15"},
    {"artist": "Nathaniel Rateliff", "date": "2025-08-20"}
  ]
}
```

**Characteristics**:
- Flexible schema (add fields anytime)
- No complex joins needed (data duplicated for speed)
- Extremely fast for specific queries
- Scales horizontally (add more servers easily)

### Why We Use DynamoDB (NoSQL)

✅ **Serverless**: No database server to manage
✅ **Speed**: Single-digit millisecond latency
✅ **Scale**: Handles millions of requests automatically
✅ **Cost**: Pay only for what you use
✅ **AWS Integration**: Works seamlessly with Lambda

**Trade-off**: Requires careful planning of how you query data

---

## React Concepts

### What is React?

**React** is a JavaScript library for building user interfaces.

**Key idea**: Break your UI into reusable **components**

**Analogy**: LEGO blocks - build complex things from simple, reusable pieces

### Components

```javascript
// A simple component - a concert card
function ConcertCard({ concert }) {
  return (
    <div className="concert-card">
      <h2>{concert.artistName}</h2>
      <p>{concert.venue}</p>
      <p>{concert.date}</p>
      <button>Buy Tickets</button>
    </div>
  );
}

// Use it in your page
function ConcertsPage() {
  return (
    <div>
      <h1>Upcoming Concerts</h1>
      <ConcertCard concert={concert1} />
      <ConcertCard concert={concert2} />
      <ConcertCard concert={concert3} />
    </div>
  );
}
```

### State

**State** = Data that can change and causes UI to update

**Example**:
```javascript
import { useState } from 'react';

function ConcertsPage() {
  // State: list of concerts
  const [concerts, setConcerts] = useState([]);

  // Load concerts when page loads
  useEffect(() => {
    fetch('/api/concerts')
      .then(response => response.json())
      .then(data => setConcerts(data)); // Update state
  }, []);

  // React automatically re-renders when concerts changes
  return (
    <div>
      {concerts.map(concert => (
        <ConcertCard key={concert.id} concert={concert} />
      ))}
    </div>
  );
}
```

### Hooks

**Hooks** = Special functions that let you use React features

**Most Common**:
- `useState`: Store and update data
- `useEffect`: Run code when component loads or updates
- `useContext`: Share data across components

---

## Development Workflow

### 1. Local Development

```bash
# Terminal 1: Run frontend (React)
cd frontend
npm run dev
# Opens http://localhost:5173

# Terminal 2: Run backend (Lambda) locally (optional)
cd backend
sam local start-api
# Creates local API at http://localhost:3000
```

**What you see**: Changes to code instantly reflected in browser

### 2. Version Control (Git)

```bash
# Make changes to code
# ...

# Save changes to Git
git add .
git commit -m "Add concert filtering feature"
git push origin main
```

**Why**: Track changes, collaborate with others, revert mistakes

### 3. Testing

```bash
# Run tests
npm test

# Types of tests:
# - Unit tests: Test individual functions
# - Integration tests: Test how parts work together
# - End-to-end tests: Test entire user flows
```

### 4. Deployment

```bash
# Deploy backend (CloudFormation updates Lambda functions)
aws cloudformation update-stack --stack-name concert-finder-dev --template-body file://main.yaml

# Deploy frontend (upload to S3)
npm run build
aws s3 sync dist/ s3://concert-finder-frontend/
```

**Result**: Your app is live and accessible to users!

---

## Common Terms Glossary

### A

**API (Application Programming Interface)**: Way for programs to talk to each other
**AWS (Amazon Web Services)**: Cloud computing platform with 200+ services

### B

**Backend**: Server-side code that processes requests and manages data
**Build**: Process of converting source code into files that can run

### C

**CDN (Content Delivery Network)**: Network of servers that deliver content faster (e.g., CloudFront)
**CORS (Cross-Origin Resource Sharing)**: Security feature that controls which websites can access your API

### D

**Deployment**: Publishing your code so it's accessible to users
**DynamoDB**: AWS's NoSQL database service

### E

**Endpoint**: A specific URL in your API (e.g., `/concerts`, `/users/me`)
**Environment Variable**: Configuration value stored outside code (e.g., API keys)

### F

**Frontend**: Client-side code that runs in the browser

### I

**IAM (Identity and Access Management)**: AWS service for managing permissions
**IaC (Infrastructure as Code)**: Defining infrastructure in code files (CloudFormation)

### J

**JSON (JavaScript Object Notation)**: Text format for data exchange
```json
{"name": "The Lumineers", "genre": "folk"}
```
**JWT (JSON Web Token)**: Secure way to transmit user information

### L

**Lambda**: AWS service that runs code without servers

### N

**NoSQL**: Database that doesn't use traditional tables (e.g., DynamoDB)

### R

**React**: JavaScript library for building user interfaces
**REST (Representational State Transfer)**: API design pattern using HTTP methods

### S

**Serverless**: Running code without managing servers
**SDK (Software Development Kit)**: Tools for developing with a platform
**S3 (Simple Storage Service)**: AWS file storage service

### V

**VPC (Virtual Private Cloud)**: Private network in AWS

---

## Learning Resources

### Frontend Development
- [React Official Tutorial](https://react.dev/learn)
- [JavaScript for Beginners](https://javascript.info/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Backend Development
- [Node.js Basics](https://nodejs.org/en/docs/guides/getting-started-guide/)
- [AWS Lambda Getting Started](https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html)

### AWS Services
- [AWS Free Tier](https://aws.amazon.com/free/)
- [DynamoDB Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [API Gateway Tutorial](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

### APIs
- [REST API Tutorial](https://restfulapi.net/)
- [HTTP Methods Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)

### Git & GitHub
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub Guides](https://guides.github.com/)

---

## Next Steps

Now that you understand the key concepts:

1. ✅ Read through the [README.md](../README.md) for project overview
2. ✅ Review [SPECIFICATIONS.md](../SPECIFICATIONS.md) for architecture
3. ✅ Follow [SETUP_GUIDE.md](../SETUP_GUIDE.md) to set up your environment
4. ✅ Start with a simple tutorial (React or AWS Lambda)
5. ✅ Begin building Concert Finder step by step!

**Remember**: Everyone starts as a beginner. Don't be afraid to ask questions and experiment!

---

**Document Status**: Complete
**Version**: 1.0
**Last Updated**: 2025-11-09
