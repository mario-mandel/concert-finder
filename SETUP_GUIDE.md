# Setup Guide

## Document Overview

This guide will walk you through setting up your development environment and deploying the Concert Finder application step-by-step. Even if you've never worked with AWS or built a full-stack application, this guide will help you get started.

**Estimated Time**: 2-3 hours for complete setup
**Difficulty**: Beginner-friendly (all steps explained)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [AWS Account Setup](#aws-account-setup)
4. [External API Registration](#external-api-registration)
5. [Local Development Setup](#local-development-setup)
6. [Infrastructure Deployment](#infrastructure-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Testing Your Setup](#testing-your-setup)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

You'll need to create accounts for the following services (all free to start):

1. **AWS Account** - For hosting infrastructure
   - Sign up: https://aws.amazon.com/free/
   - Free tier: 12 months of free services
   - Credit card required (but won't be charged during free tier)

2. **Spotify Developer Account**
   - Sign up: https://developer.spotify.com/
   - Completely free, no credit card needed
   - Uses your existing Spotify account (or create free account)

3. **Ticketmaster Developer Account**
   - Sign up: https://developer.ticketmaster.com/
   - Free tier: 5,000 requests/day
   - No credit card required

4. **GitHub Account** (optional but recommended)
   - Sign up: https://github.com/
   - For version control and CI/CD

### System Requirements

**Operating System**:
- macOS, Windows, or Linux
- You're on macOS (Darwin 25.1.0) ✓

**Minimum Hardware**:
- 8GB RAM
- 10GB free disk space
- Internet connection

---

## Development Environment Setup

### Step 1: Install Node.js

Node.js is a JavaScript runtime that we'll use for both frontend and backend development.

**macOS (using Homebrew)**:
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (LTS version)
brew install node@18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

**Alternative (using nvm - recommended for managing multiple Node versions)**:
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal, then:
nvm install 18
nvm use 18
nvm alias default 18
```

### Step 2: Install AWS CLI

The AWS Command Line Interface lets you interact with AWS services from your terminal.

**macOS**:
```bash
# Using Homebrew
brew install awscli

# Verify installation
aws --version  # Should show aws-cli/2.x.x
```

**Manual installation (alternative)**:
```bash
# Download and install
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### Step 3: Install AWS SAM CLI (Optional for local testing)

AWS SAM (Serverless Application Model) helps develop and test Lambda functions locally.

**macOS**:
```bash
brew tap aws/tap
brew install aws-sam-cli

# Verify installation
sam --version  # Should show SAM CLI version
```

### Step 4: Install Git (if not already installed)

```bash
# Check if Git is installed
git --version

# If not installed (macOS):
brew install git
```

### Step 5: Install a Code Editor

**Recommended: Visual Studio Code**
- Download: https://code.visualstudio.com/
- Free and open-source
- Excellent extensions for JavaScript/React/AWS

**Useful VS Code Extensions**:
- ESLint
- Prettier
- AWS Toolkit
- GitLens
- Thunder Client (for testing APIs)

---

## AWS Account Setup

### Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process:
   - Enter email and password
   - Choose "Personal" account type
   - Provide billing information (credit card required)
   - Verify phone number
   - Select "Basic Support - Free"

**Important**: Set up billing alerts!

### Step 2: Set Up Billing Alerts

This prevents unexpected charges:

1. Sign in to AWS Console: https://console.aws.amazon.com/
2. Click your account name → "Billing and Cost Management"
3. Left sidebar → "Billing preferences"
4. Enable:
   - ✅ Receive Free Tier Usage Alerts
   - ✅ Receive Billing Alerts
5. Enter your email address
6. Save preferences

**Create a Budget**:
1. Billing Dashboard → "Budgets" → "Create budget"
2. Choose "Cost budget"
3. Name: "Concert Finder Development"
4. Amount: $10/month (should be well under this)
5. Add alert at 80% ($8)
6. Create budget

### Step 3: Create IAM User (Security Best Practice)

Never use your root AWS account for development. Create an IAM user instead:

1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Left sidebar → "Users" → "Create user"
3. User name: `concert-finder-dev`
4. Check: ✅ Provide user access to AWS Management Console
5. Select "I want to create an IAM user"
6. Set a secure password
7. Click "Next"

**Set Permissions**:
1. Choose "Attach policies directly"
2. Search and select these policies:
   - `AdministratorAccess` (for development; restrict in production)
3. Click "Next" → "Create user"

**Create Access Keys** (for CLI):
1. Click on the user you just created
2. "Security credentials" tab → "Create access key"
3. Choose "Command Line Interface (CLI)"
4. Check acknowledgment → "Next"
5. Description: "Local development"
6. "Create access key"
7. **IMPORTANT**: Download the CSV file or copy both:
   - Access key ID
   - Secret access key
   - You won't be able to see the secret key again!

### Step 4: Configure AWS CLI

Configure the AWS CLI with your IAM user credentials:

```bash
# Run configuration wizard
aws configure

# You'll be prompted for:
AWS Access Key ID: [paste your access key ID]
AWS Secret Access Key: [paste your secret access key]
Default region name: us-west-2  # or your preferred region
Default output format: json
```

**Verify configuration**:
```bash
# Test AWS CLI
aws sts get-caller-identity

# Should return:
# {
#     "UserId": "AIDACKCEVSQ6C2EXAMPLE",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/concert-finder-dev"
# }
```

### Step 5: Choose Your AWS Region

We recommend `us-west-2` (Oregon) for Denver-based users because:
- Close geographic proximity (low latency)
- All AWS services available
- Competitive pricing

**Note your region** - you'll need it throughout the setup.

---

## External API Registration

### Spotify Developer Account

#### Step 1: Create Spotify App

1. Go to https://developer.spotify.com/dashboard/
2. Log in with your Spotify account (or create free account)
3. Click "Create app"
4. Fill in details:
   - **App name**: `Concert Finder`
   - **App description**: `Personal concert discovery app`
   - **Website**: `http://localhost:3000` (for now)
   - **Redirect URI**: `http://localhost:3000/callback/spotify`
   - Check: ✅ Web API
5. Agree to terms → "Save"

#### Step 2: Get API Credentials

1. Click on your app
2. Click "Settings"
3. You'll see:
   - **Client ID**: `abc123...` (visible)
   - **Client Secret**: Click "View client secret" (keep this secret!)
4. **Save these somewhere safe** - you'll need them later

#### Step 3: Add Redirect URIs

Later, when deploying to production, add:
- `https://your-domain.com/callback/spotify`

### Ticketmaster Developer Account

#### Step 1: Register for API Key

1. Go to https://developer.ticketmaster.com/
2. Click "Sign In" → "Register"
3. Fill out registration form
4. Verify your email
5. Sign in

#### Step 2: Create API Key

1. Dashboard → "Add a new app"
2. Fill in:
   - **App name**: `Concert Finder`
   - **App description**: `Concert discovery app for Denver`
3. Click "Save"
4. You'll get an **API Key** (also called Consumer Key)
5. **Save this** - you'll need it for the backend

#### Step 3: Test Your API Key

```bash
# Test Ticketmaster API
curl "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_API_KEY&city=Denver&classificationName=music"

# Should return JSON with Denver concerts
```

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
# Navigate to your projects directory
cd /Users/mariomandel/Workspace

# Navigate to the concert-finder project (already created)
cd concert-finder

# Check git status
git status
```

### Step 2: Create Project Structure

Let's create the directory structure for our project:

```bash
# Create all directories at once
mkdir -p frontend/src/{components,pages,services,utils,hooks,contexts}
mkdir -p frontend/public
mkdir -p backend/functions/{auth,concerts,spotify,notifications,recommendations}
mkdir -p backend/lib/{utils,db,external-apis}
mkdir -p backend/layers/common-layer/nodejs
mkdir -p infrastructure
mkdir -p scripts
mkdir -p tests/{unit,integration}
mkdir -p docs/{aws-setup,architecture}
mkdir -p .github/workflows
```

### Step 3: Create Environment Files

Create a `.env.example` file for documenting required environment variables:

```bash
# Create .env.example in frontend directory
cat > frontend/.env.example << 'EOF'
# Frontend Environment Variables (Example)

# API Gateway URL (will be created after deployment)
VITE_API_URL=https://api-id.execute-api.us-west-2.amazonaws.com/prod

# AWS Cognito Configuration
VITE_COGNITO_USER_POOL_ID=us-west-2_abc123
VITE_COGNITO_CLIENT_ID=abc123xyz

# AWS Region
VITE_AWS_REGION=us-west-2

# Environment
VITE_ENVIRONMENT=development
EOF
```

```bash
# Create .env.example in backend directory
cat > backend/.env.example << 'EOF'
# Backend Environment Variables (Example)

# Spotify API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=https://your-domain.com/callback/spotify

# Ticketmaster API
TICKETMASTER_API_KEY=your-ticketmaster-api-key

# AWS Resources (auto-populated from CloudFormation)
USERS_TABLE_NAME=concert-finder-main
AWS_REGION=us-west-2

# Encryption
KMS_KEY_ID=alias/concert-finder-key
EOF
```

### Step 4: Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.cache/

# AWS
.aws-sam/
samconfig.toml
cdk.out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*.sublime-*

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Test coverage
coverage/

# Temporary files
tmp/
temp/
EOF
```

### Step 5: Initialize Frontend

```bash
# Navigate to frontend directory
cd frontend

# Initialize React app with Vite
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install additional dependencies
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npm install amazon-cognito-identity-js

# Initialize Tailwind CSS
npx tailwindcss init -p
```

**Configure Tailwind** (`frontend/tailwind.config.js`):
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add Tailwind to CSS (`frontend/src/index.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 6: Initialize Backend

```bash
# Navigate to backend directory
cd ../backend

# Initialize npm
npm init -y

# Install common dependencies
npm install aws-sdk axios
npm install -D aws-sam-cli
```

---

## Infrastructure Deployment

### Step 1: Create CloudFormation Templates

We'll create these in the next phase, but here's an overview:

**Main Infrastructure** (`infrastructure/main.yaml`):
- DynamoDB table
- Lambda functions
- API Gateway
- Cognito User Pool

### Step 2: Deploy Infrastructure

```bash
# Navigate to infrastructure directory
cd infrastructure

# Validate CloudFormation template (once created)
aws cloudformation validate-template --template-body file://main.yaml

# Create stack
aws cloudformation create-stack \
  --stack-name concert-finder-dev \
  --template-body file://main.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_IAM \
  --region us-west-2

# Monitor stack creation
aws cloudformation describe-stacks \
  --stack-name concert-finder-dev \
  --region us-west-2 \
  --query 'Stacks[0].StackStatus'

# Get stack outputs (API URL, User Pool ID, etc.)
aws cloudformation describe-stacks \
  --stack-name concert-finder-dev \
  --region us-west-2 \
  --query 'Stacks[0].Outputs'
```

**Stack creation takes 5-10 minutes**. You'll see status progress:
- `CREATE_IN_PROGRESS` → Creating resources
- `CREATE_COMPLETE` → Success!
- `ROLLBACK_IN_PROGRESS` → Error (check events for details)

### Step 3: Store Secrets in AWS Secrets Manager

```bash
# Store Spotify credentials
aws secretsmanager create-secret \
  --name concert-finder/spotify \
  --description "Spotify API credentials" \
  --secret-string '{"clientId":"YOUR_CLIENT_ID","clientSecret":"YOUR_CLIENT_SECRET"}' \
  --region us-west-2

# Store Ticketmaster API key
aws secretsmanager create-secret \
  --name concert-finder/ticketmaster \
  --description "Ticketmaster API key" \
  --secret-string '{"apiKey":"YOUR_API_KEY"}' \
  --region us-west-2

# Verify secrets
aws secretsmanager list-secrets --region us-west-2
```

---

## Frontend Deployment

### Step 1: Build Frontend

```bash
cd frontend

# Create production build
npm run build

# Output will be in dist/ directory
```

### Step 2: Create S3 Bucket

```bash
# Create S3 bucket for frontend (bucket name must be globally unique)
aws s3 mb s3://concert-finder-frontend-YOUR_NAME-dev --region us-west-2

# Enable static website hosting
aws s3 website s3://concert-finder-frontend-YOUR_NAME-dev/ \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read access
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::concert-finder-frontend-YOUR_NAME-dev/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket concert-finder-frontend-YOUR_NAME-dev \
  --policy file:///tmp/bucket-policy.json
```

### Step 3: Deploy to S3

```bash
# Upload build to S3
aws s3 sync dist/ s3://concert-finder-frontend-YOUR_NAME-dev/

# Get website URL
aws s3api get-bucket-website \
  --bucket concert-finder-frontend-YOUR_NAME-dev \
  --query 'WebsiteURL'

# Website will be accessible at:
# http://concert-finder-frontend-YOUR_NAME-dev.s3-website-us-west-2.amazonaws.com
```

### Step 4: Configure CloudFront (Optional - for HTTPS and CDN)

```bash
# Create CloudFront distribution via AWS Console or CLI
# This provides HTTPS and global content delivery
# Follow AWS documentation: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html
```

---

## Testing Your Setup

### Step 1: Test Backend APIs

```bash
# Get API Gateway URL from CloudFormation outputs
API_URL=$(aws cloudformation describe-stacks \
  --stack-name concert-finder-dev \
  --region us-west-2 \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text)

echo "API URL: $API_URL"

# Test public endpoint (if you created one)
curl $API_URL/health

# Should return:
# {"status":"healthy","timestamp":"2025-11-09T14:00:00Z"}
```

### Step 2: Test User Registration

```bash
# Use AWS Console or frontend to register a user
# Or use AWS CLI to create a user in Cognito:
aws cognito-idp sign-up \
  --client-id YOUR_CLIENT_ID \
  --username user@example.com \
  --password YourSecurePassword123!
```

### Step 3: Test Frontend

1. Open frontend URL in browser
2. Should see Concert Finder landing page
3. Try signing up / logging in
4. Test Spotify connection flow

---

## Troubleshooting

### Common Issues

#### Issue: AWS CLI not configured

**Error**: `Unable to locate credentials`

**Solution**:
```bash
aws configure
# Enter your access key, secret key, region
```

#### Issue: CloudFormation stack creation failed

**Error**: `CREATE_FAILED` status

**Solution**:
```bash
# Check stack events for error details
aws cloudformation describe-stack-events \
  --stack-name concert-finder-dev \
  --max-items 10

# Common causes:
# - IAM permissions missing
# - Resource names already in use
# - Invalid parameters
```

#### Issue: S3 bucket name already exists

**Error**: `BucketAlreadyExists`

**Solution**:
```bash
# Bucket names must be globally unique
# Try a different name, e.g., concert-finder-frontend-yourname-dev-123
```

#### Issue: Lambda function timeout

**Error**: `Task timed out after 3.00 seconds`

**Solution**:
```bash
# Increase Lambda timeout in CloudFormation template
# Timeout: 30 (seconds)
```

#### Issue: CORS errors in frontend

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**:
- Check API Gateway CORS configuration
- Ensure allowed origins include your frontend URL
- Enable CORS for OPTIONS requests

#### Issue: Cognito user not confirmed

**Error**: `UserNotConfirmedException`

**Solution**:
```bash
# Admin confirm user (for testing)
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id YOUR_USER_POOL_ID \
  --username user@example.com
```

### Getting Help

1. **AWS Documentation**: https://docs.aws.amazon.com/
2. **AWS Support Forums**: https://repost.aws/
3. **Spotify API Docs**: https://developer.spotify.com/documentation/
4. **Ticketmaster API Docs**: https://developer.ticketmaster.com/products-and-docs/apis/
5. **GitHub Issues**: Open an issue in this repository

---

## Next Steps

Once your environment is set up:

1. ✅ Review all specification documents
2. ✅ Familiarize yourself with AWS Console
3. ✅ Test external APIs (Spotify, Ticketmaster)
4. [ ] Begin Phase 1 development (authentication)
5. [ ] Set up automated testing
6. [ ] Configure CI/CD pipeline

---

## Development Workflow

### Daily Development

```bash
# Start frontend dev server
cd frontend
npm run dev  # Opens at http://localhost:5173

# In another terminal, test Lambda functions locally (using SAM)
cd backend
sam local start-api  # Starts local API Gateway
```

### Deployment Workflow

```bash
# 1. Make changes to code
# 2. Test locally
# 3. Commit to git
git add .
git commit -m "Add feature X"

# 4. Deploy backend
cd infrastructure
aws cloudformation update-stack \
  --stack-name concert-finder-dev \
  --template-body file://main.yaml \
  --capabilities CAPABILITY_IAM

# 5. Deploy frontend
cd ../frontend
npm run build
aws s3 sync dist/ s3://concert-finder-frontend-YOUR_NAME-dev/

# 6. Test in production
```

---

## Security Checklist

Before going to production:

- [ ] Remove administrator access from IAM user
- [ ] Enable MFA on all AWS accounts
- [ ] Review all IAM policies (principle of least privilege)
- [ ] Enable CloudTrail for audit logging
- [ ] Set up AWS Config for compliance monitoring
- [ ] Enable AWS GuardDuty for threat detection
- [ ] Review all S3 bucket policies (no public access to sensitive data)
- [ ] Rotate API keys and credentials
- [ ] Set up AWS Secrets Manager rotation
- [ ] Enable VPC endpoints for private AWS service access
- [ ] Configure WAF (Web Application Firewall) for API Gateway
- [ ] Set up AWS Shield for DDoS protection

---

## Cost Monitoring

### Daily Checks

```bash
# Check current month's costs
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-09 \
  --granularity DAILY \
  --metrics "UnblendedCost" \
  --group-by Type=SERVICE

# Should be under $1/day for development
```

### Monthly Review

1. AWS Console → Billing Dashboard
2. Review costs by service
3. Check free tier usage
4. Adjust resources if needed (delete unused resources)

---

## Congratulations!

You've successfully set up your Concert Finder development environment!

**What you've accomplished**:
- ✅ Installed all development tools
- ✅ Created and configured AWS account
- ✅ Registered for external APIs
- ✅ Set up security and billing alerts
- ✅ Created project structure

**You're now ready to start building!**

---

**Document Status**: Complete
**Version**: 1.0
**Last Updated**: 2025-11-09
