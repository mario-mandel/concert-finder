# Concert Finder 🎵🎤

> A personalized concert discovery app that tracks your favorite artists and notifies you about upcoming shows in Denver, with AI-powered recommendations to help you discover new music.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Status](#project-status)
- [Documentation](#documentation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)

## Overview

Concert Finder solves a common problem for music lovers: staying up-to-date with concert announcements from your favorite artists. Instead of manually checking tour dates or missing shows, this app lets you track your favorite artists and automatically alerts you when they're playing in Denver.

### The Problem
- Artists announce tours across multiple platforms
- Easy to miss shows from artists you love
- Discovering new artists that match your taste is time-consuming
- No centralized way to track all your favorite artists' tour schedules

### The Solution
Concert Finder makes concert tracking simple:
1. **Track Artists**: Manually add your favorite artists to track
2. **Find Local Shows**: Automatically search for upcoming concerts in the Denver area
3. **Smart Notifications**: Get email alerts when your artists announce Denver shows
4. **AI Recommendations** (Phase 3): Discover new artists and concerts based on your tracked artists

## Features

### Phase 1: MVP (Minimum Viable Product)
- ✅ User authentication and authorization
- ✅ Manual artist tracking (search and add artists)
- ✅ Concert data aggregation from Ticketmaster API
- ✅ Denver-area venue filtering
- ✅ Simple web dashboard showing upcoming concerts
- ✅ Basic email notifications for new concert announcements

### Phase 2: Enhanced Features
- 🔄 SMS notifications via AWS SNS
- 🔄 Concert calendar export (iCal format)
- 🔄 Ticket purchase links and pricing information
- 🔄 User preferences (notification settings, venue preferences)
- 🔄 Optional Spotify/Apple Music integration for bulk artist import

### Phase 3: AI-Powered Discovery
- 🔮 AI-powered concert recommendations using AWS Bedrock
- 🔮 Similar artist discovery
- 🔮 Personalized "Concerts You Might Like" suggestions
- 🔮 Genre and mood-based concert browsing

## Tech Stack

### Frontend
- **React** - Modern, component-based UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Hosted on**: AWS S3 + CloudFront (static website hosting with CDN)

### Backend
- **AWS Lambda** - Serverless functions for all API logic
- **API Gateway** - RESTful API management and routing
- **Node.js** - Runtime for Lambda functions
- **Python** (optional) - For data processing and AI features

### Data & Storage
- **DynamoDB** - NoSQL database for user data, preferences, and cached concert information
- **S3** - Object storage for any assets or logs

### Authentication
- **AWS Cognito** - User authentication and authorization

### Integrations
- **Ticketmaster Discovery API** - Concert and event data
- **Songkick API** (alternative/future) - Additional concert data source
- **Spotify/Apple Music APIs** (Phase 2) - Optional bulk artist import

### Notifications
- **AWS SNS** - SMS notifications
- **AWS SES** - Email notifications
- **EventBridge** - Scheduled tasks for checking new concert announcements

### AI/ML (Phase 3)
- **AWS Bedrock** - Generative AI for recommendations
- **AWS SageMaker** (optional) - Custom ML models for taste analysis

### DevOps & Infrastructure
- **AWS CloudFormation** - Infrastructure as Code (IaC)
- **GitHub Actions** - CI/CD pipeline
- **AWS SAM** (Serverless Application Model) - Simplified Lambda deployment

## Project Status

🚀 **Current Phase**: Phase 2 - MVP Development (Week 3)

### What's Been Completed

**Phase 1: Foundation & Setup** ✅
- [x] Project initialization
- [x] README documentation
- [x] Technical specifications
- [x] API design documentation
- [x] Data models and database schema
- [x] Setup and deployment guides
- [x] AWS account setup
- [x] Ticketmaster API key obtained
- [x] Development environment configured
- [x] GitHub repository created

**First Lambda Function Deployed!** 🎉
- [x] Artist search Lambda function
- [x] AWS SAM template and deployment
- [x] API Gateway integration
- [x] Live API endpoint: https://4z11zbyuvg.execute-api.us-west-2.amazonaws.com/development/

### Try It Out!

```bash
# Search for artists
curl "https://4z11zbyuvg.execute-api.us-west-2.amazonaws.com/development/api/v1/artists/search?q=lumineers"
```

## Documentation

This project includes comprehensive documentation to help you understand every aspect:

- **[README.md](README.md)** (this file) - Project overview and getting started
- **[SPECIFICATIONS.md](SPECIFICATIONS.md)** - Detailed technical architecture and requirements
- **[API_DESIGN.md](API_DESIGN.md)** - API endpoints, request/response formats (OpenAPI spec)
- **[DATA_MODELS.md](DATA_MODELS.md)** - Database schema and data structures
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Step-by-step setup and deployment instructions
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture diagrams
- **[docs/CONCEPTS.md](docs/CONCEPTS.md)** - Explanations of key concepts for beginners

## Getting Started

### Prerequisites

Before you begin, you'll need:
- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **AWS Account** - [Sign up for free tier](https://aws.amazon.com/free/)
- **Ticketmaster API Key** - [Register here](https://developer.ticketmaster.com/)
- **Git** - Version control
- **AWS CLI** - [Installation guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/concert-finder.git
cd concert-finder

# Install dependencies
npm install

# Set up AWS credentials
aws configure

# Deploy infrastructure (when ready)
npm run deploy

# Start local development server
npm run dev
```

For detailed setup instructions, see **[SETUP_GUIDE.md](SETUP_GUIDE.md)**.

## Project Structure

```
concert-finder/
├── docs/                          # Additional documentation
│   ├── ARCHITECTURE.md           # Architecture diagrams and explanations
│   ├── CONCEPTS.md               # Key concepts for beginners
│   └── aws-setup/                # AWS-specific setup guides
├── frontend/                      # React web application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page-level components
│   │   ├── services/             # API integration logic
│   │   └── utils/                # Helper functions
│   ├── public/                   # Static assets
│   └── package.json
├── backend/                       # AWS Lambda functions
│   ├── functions/                # Individual Lambda handlers
│   │   ├── auth/                 # Authentication functions
│   │   ├── concerts/             # Concert data functions
│   │   ├── spotify/              # Spotify integration
│   │   └── notifications/        # Notification functions
│   ├── layers/                   # Lambda layers (shared dependencies)
│   └── lib/                      # Shared utility code
├── infrastructure/                # AWS CloudFormation templates
│   ├── main.yaml                 # Main stack template
│   ├── cognito.yaml              # Authentication resources
│   ├── api.yaml                  # API Gateway configuration
│   ├── database.yaml             # DynamoDB tables
│   └── notifications.yaml        # SNS/SES configuration
├── scripts/                       # Deployment and utility scripts
│   ├── deploy.sh                 # Deployment automation
│   └── setup-spotify.sh          # Spotify API setup helper
├── tests/                         # Test suites
│   ├── unit/                     # Unit tests
│   └── integration/              # Integration tests
├── .github/
│   └── workflows/                # CI/CD pipelines
├── SPECIFICATIONS.md             # Technical specifications
├── API_DESIGN.md                 # API documentation
├── DATA_MODELS.md                # Database schema
├── SETUP_GUIDE.md                # Setup instructions
└── README.md                     # This file
```

## Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [x] Complete all specification documents
- [ ] Set up AWS account and configure services
- [ ] Obtain Ticketmaster API key
- [ ] Set up development environment
- [ ] Create project boilerplate

### Phase 2: MVP Development (Weeks 3-6)
- [ ] Implement user authentication (Cognito)
- [ ] Build artist search and management UI
- [ ] Integrate Ticketmaster concert data API
- [ ] Create basic UI for concert browsing
- [ ] Implement email notifications
- [ ] Deploy to AWS

### Phase 3: Enhanced Features (Weeks 7-8)
- [ ] Add SMS notifications
- [ ] Implement user preferences
- [ ] Create calendar export feature
- [ ] Add ticket purchase links
- [ ] Improve UI/UX

### Phase 4: AI Features (Weeks 9-12)
- [ ] Integrate AWS Bedrock for recommendations
- [ ] Build recommendation algorithm
- [ ] Add similar artist discovery
- [ ] Create personalized concert feed

### Phase 5: Polish & Launch (Weeks 13-14)
- [ ] Performance optimization
- [ ] Security audit
- [ ] User testing
- [ ] Documentation finalization
- [ ] Public launch

## Learning Resources

New to these technologies? Here are some helpful resources:

- **React**: [Official Tutorial](https://react.dev/learn)
- **AWS Lambda**: [Getting Started Guide](https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html)
- **DynamoDB**: [Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- **Ticketmaster API**: [Discovery API Documentation](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)
- **API Design**: [REST API Best Practices](https://restfulapi.net/)

## Contributing

This is a personal learning project, but suggestions and feedback are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests for improvements
- Share your own concert finder implementations

## License

MIT License - feel free to use this project as a learning resource or starting point for your own concert tracker.

## Contact

Built with ❤️ for music lovers in Denver

---

**Note**: This project uses the Ticketmaster Discovery API. Make sure to review their terms of service and rate limits when deploying to production. The free tier includes 5,000 API calls per day.
