#!/bin/bash

# Build verification script for OnDesk
# This script checks TypeScript, builds the app, and tests Docker build

set -e

echo "🔍 Step 1/4: Checking TypeScript..."
npx tsc --noEmit
echo "✅ TypeScript check passed!"
echo ""

echo "📦 Step 2/4: Building application..."
npm run build
echo "✅ Application build passed!"
echo ""

echo "🐳 Step 3/4: Building Docker image..."
docker compose build
echo "✅ Docker build passed!"
echo ""

echo "🚀 Step 4/4: Starting container..."
docker compose up -d
echo "✅ Container started!"
echo ""

echo "================================"
echo "✅ All checks passed!"
echo "================================"
echo ""
echo "🌐 Application is running at: http://localhost:8080"
echo ""
echo "Useful commands:"
echo "  - View logs: docker compose logs -f"
echo "  - Stop container: docker compose down"
echo "  - Check status: docker compose ps"
