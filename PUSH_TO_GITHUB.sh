#!/bin/bash

# Script to push your YouTube Video Clipper to GitHub
# Run this from the project directory

echo "🚀 Pushing YouTube Video Clipper to GitHub..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Add GitHub remote if not already added
if ! git remote | grep -q "github"; then
    echo "Adding GitHub remote..."
    git remote add github https://github.com/RibaModishi/youtube-video-clipper.git
fi

# Show current status
echo "Current branch:"
git branch --show-current
echo ""

echo "Recent commits:"
git log --oneline -3
echo ""

# Push to GitHub
echo "Pushing to GitHub (you may need to enter your credentials)..."
git push github main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Code pushed to GitHub!"
    echo "🔗 View your repository: https://github.com/RibaModishi/youtube-video-clipper"
    echo ""
    echo "📱 Next steps:"
    echo "1. Go to https://railway.app or https://render.com"
    echo "2. Sign up/login with your GitHub account"
    echo "3. Deploy from your new repository"
    echo "4. Get your URL and use it on your iPhone!"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "1. Create a Personal Access Token at: https://github.com/settings/tokens"
    echo "2. Use it as your password when prompted"
    echo ""
    echo "Or push manually with:"
    echo "git push https://github.com/RibaModishi/youtube-video-clipper.git main"
fi
