# Concert Finder - Frontend

## Overview

This is the React frontend for Concert Finder. It provides the user interface for browsing concerts, connecting to Spotify, and managing notifications.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **AWS Cognito SDK** - Authentication

## Directory Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── services/       # API integration logic
│   ├── utils/          # Helper functions
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React Context providers
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
└── package.json        # Dependencies
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in this directory:

```
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=us-west-2_abc123
VITE_COGNITO_CLIENT_ID=abc123xyz
VITE_AWS_REGION=us-west-2
```

## Component Structure

### Pages
- **HomePage** - Landing page
- **DashboardPage** - Main concert browsing interface
- **LoginPage** - User authentication
- **SettingsPage** - User preferences

### Components
- **ConcertCard** - Display concert information
- **ArtistList** - List of user's favorite artists
- **NotificationBadge** - Show unread notifications
- **Navigation** - App navigation bar

## Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Deployment

Frontend is deployed to AWS S3 + CloudFront:

```bash
# Build production version
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name/
```

## Notes

- All API calls should go through the `services/api.js` wrapper
- Authentication state is managed in `contexts/AuthContext.jsx`
- Use Tailwind CSS classes for styling (avoid inline styles)
