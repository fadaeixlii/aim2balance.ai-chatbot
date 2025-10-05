# LibreChat Local Development Setup Guide

This guide will help you run LibreChat in development mode on your local machine without Docker for the application itself.

## Prerequisites

- **Node.js** v22.20.0 (as specified in package.json)
- **npm** (comes with Node.js)
- **Docker Desktop** (for running MongoDB, Redis, MeiliSearch)
- **Git**

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd d:\project\aim2balance.ai\chat-bot

# Install all dependencies using npm ci (clean install)
# This ensures exact versions from package-lock.json
npm ci
```

### 2. Set Up Environment Variables

```bash
# Copy the example .env file
copy .env.example .env

# Copy the example config file
copy librechat.example.yaml librechat.yaml
```

**Important**: The `.env` file contains default values that work for local development. For production, you should generate proper secrets using: https://www.librechat.ai/toolkit/creds_generator

### 3. Start Required Services with Docker

We've created a simplified `docker-compose.dev.yml` that runs only the required services:

```bash
# Start MongoDB, Redis, and MeiliSearch
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker ps
```

You should see 3 containers:

- `librechat-mongodb-dev` on port 27017
- `librechat-redis-dev` on port 6379
- `librechat-meilisearch-dev` on port 7700

### 4. Build Required Packages (One-Time Setup)

The monorepo has internal packages that need to be built before running:

```bash
# Build all required packages in order (this takes 5-10 minutes)
npm run build:data-schemas
npm run build:data-provider
npm run build:api
npm run build:client-package
```

**Note**: You'll see some TypeScript warnings during the build. These are non-critical and won't prevent the build from completing.

### 5. Build Frontend (One-Time Setup)

```bash
# Build the frontend to create the dist folder
npm run frontend
```

This creates `client/dist/index.html` which the backend needs to start. **Note**: This is only needed once for the initial setup.

### 6. Start Development Servers

Open **two separate terminal windows**:

**Terminal 1 - Backend Server:**

```bash
npm run backend:dev
```

The backend will start on `http://localhost:3080`

**Terminal 2 - Frontend Dev Server:**

```bash
npm run frontend:dev
```

The frontend will start on `http://localhost:3090`

### 7. Access the Application

Open your browser and navigate to:

```
http://localhost:3090/
```

The frontend dev server (Vite) will proxy API requests to the backend automatically.

## Common Issues and Solutions

### Issue: `Cannot find module 'semver/functions/coerce'`

**Solution**: Add missing dependency

```bash
cd api
npm install semver
cd ..
```

### Issue: `Cannot find module 'redis'`

**Solution**: Add missing dependency

```bash
cd api
npm install redis
cd ..
```

### Issue: `Cannot find module 'unenv/mock/empty'`

**Solution**: Add missing dependency

```bash
cd client
npm install unenv
cd ..
```

### Issue: Backend crashes with `ENOENT: no such file or directory, open 'client\dist\index.html'`

**Solution**: Build the frontend first

```bash
npm run frontend
```

### Issue: MeiliSearch errors in backend logs

**Solution**: These are warnings and won't prevent the app from running. MeiliSearch is optional for basic functionality.

### Issue: Frontend build is stuck or very slow

**Solution**: The build process can take 5-10 minutes. Be patient. The TypeScript warnings are normal and won't stop the build.

## Development Workflow

### Making Frontend Changes

The frontend dev server (Vite) supports hot module replacement (HMR). Just save your files and changes will appear instantly in the browser.

### Making Backend Changes

Nodemon will automatically restart the backend server when you save files.

### Rebuilding Packages

If you modify files in the `packages/` directory, you'll need to rebuild:

```bash
# Rebuild specific package
npm run build:data-schemas
# or
npm run build:api
# etc.
```

## Stopping Services

### Stop Development Servers

Press `Ctrl+C` in each terminal window.

### Stop Docker Services

```bash
# Stop but keep data
docker-compose -f docker-compose.dev.yml down

# Stop and remove all data (fresh start)
docker-compose -f docker-compose.dev.yml down -v
```

## Quick Start Script

For convenience, here's a script to start everything:

**Windows (start-dev.bat):**

```batch
@echo off
echo Starting Docker services...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo Starting backend server...
start cmd /k "npm run backend:dev"

timeout /t 5

echo Starting frontend server...
start cmd /k "npm run frontend:dev"

echo.
echo Development servers starting...
echo Backend: http://localhost:3080
echo Frontend: http://localhost:3090
echo.
echo Press any key to open browser...
pause
start http://localhost:3090
```

## Environment Variables Reference

Key variables in `.env`:

- `MONGO_URI=mongodb://127.0.0.1:27017/LibreChat` - MongoDB connection
- `PORT=3080` - Backend server port
- `HOST=localhost` - Backend host
- `DOMAIN_CLIENT=http://localhost:3080` - Client domain
- `DOMAIN_SERVER=http://localhost:3080` - Server domain

## API Keys (Optional)

To use AI providers, add their API keys to `.env`:

```env
# OpenAI
OPENAI_API_KEY=your_key_here

# Anthropic
ANTHROPIC_API_KEY=your_key_here

# Google
GOOGLE_API_KEY=your_key_here

# etc.
```

See `.env.example` for all available options.

## Troubleshooting

### Check Docker Services

```bash
docker ps
docker logs librechat-mongodb-dev
docker logs librechat-redis-dev
```

### Check Backend Logs

The backend outputs detailed logs. Look for errors in the terminal where you ran `npm run backend:dev`.

### Check Frontend Logs

Open browser DevTools (F12) and check the Console tab for errors.

### Reset Everything

```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down -v

# Remove node_modules
rm -rf node_modules client/node_modules api/node_modules packages/*/node_modules

# Reinstall with npm ci
npm ci

# Rebuild packages in order
npm run build:data-schemas
npm run build:data-provider
npm run build:api
npm run build:client-package

# Build frontend (one-time)
npm run frontend

# Start Docker services
docker-compose -f docker-compose.dev.yml up -d

# Start servers
npm run backend:dev  # Terminal 1
npm run frontend:dev # Terminal 2
```

## Additional Resources

- [LibreChat Documentation](https://www.librechat.ai/docs)
- [LibreChat NPM Installation Guide](https://www.librechat.ai/docs/local/npm)
- [Configuration Guide](https://www.librechat.ai/docs/configuration/dotenv)
- [LibreChat YAML Config](https://www.librechat.ai/docs/configuration/librechat_yaml)

## Support

If you encounter issues:

1. Check the logs in both terminal windows
2. Check Docker container logs
3. Refer to the official documentation
4. Check GitHub issues: https://github.com/danny-avila/LibreChat/issues
