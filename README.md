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

Concert Finder solves a common problem for music lovers: staying up-to-date with concert announcements from your favorite artists. Instead of manually checking tour dates or missing shows, this app automatically tracks your favorite artists from Spotify and alerts you when they're playing in Denver.

### The Problem
- Artists announce tours across multiple platforms
- Easy to miss shows from artists you love
- Discovering new artists that match your taste is time-consuming
- No centralized way to track all your favorite artists' tour schedules

### The Solution
Concert Finder integrates with your Spotify account to:
1. **Track Favorites**: Automatically monitor all your favorited artists
2. **Find Local Shows**: Search for upcoming concerts in the Denver area
3. **Smart Notifications**: Get alerts when your artists announce Denver shows
4. **AI Recommendations**: Discover new artists and concerts based on your music taste

## Features

### Phase 1: MVP (Minimum Viable Product)
- ✅ User authentication and authorization
- ✅ Spotify integration to fetch favorite artists
- ✅ Concert data aggregation from multiple sources (Ticketmaster, Songkick)
- ✅ Denver-area venue filtering
- ✅ Simple web dashboard showing upcoming concerts
- ✅ Basic email notifications for new concert announcements

### Phase 2: Enhanced Features
- 🔄 SMS notifications via AWS SNS
- 🔄 Concert calendar export (iCal format)
- 🔄 Ticket purchase links and pricing information
- 🔄 User preferences (notification settings, venue preferences)

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
- **Spotify Web API** - Access user's favorite artists and listening history
- **Ticketmaster Discovery API** - Concert and event data
- **Songkick API** (alternative) - Additional concert data source

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

🚧 **Current Phase**: Specification & Design

We're taking a **spec-driven development** approach, which means we're thoroughly planning and documenting the architecture before writing code. This ensures we build the right thing and avoid costly rewrites.

### What's Been Completed
- [x] Project initialization
- [x] README documentation
- [ ] Technical specifications
- [ ] API design documentation
- [ ] Data models and database schema
- [ ] Setup and deployment guides

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
- **Spotify Account** - For API access and testing
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
- [ ] Complete all specification documents
- [ ] Set up AWS account and configure services
- [ ] Register Spotify Developer application
- [ ] Set up development environment
- [ ] Create project boilerplate

### Phase 2: MVP Development (Weeks 3-6)
- [ ] Implement user authentication (Cognito)
- [ ] Build Spotify integration
- [ ] Integrate concert data APIs
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
- **Spotify API**: [Web API Documentation](https://developer.spotify.com/documentation/web-api)
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

**Note**: This project uses the Spotify Web API and various concert data APIs. Make sure to review their terms of service and rate limits when deploying to production.
