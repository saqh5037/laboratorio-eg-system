#!/bin/bash

# Quick connect and setup script
# This will connect to AWS EC2 and run the setup

echo "🚀 Connecting to AWS EC2 Server..."
echo "================================================="
echo ""
echo "Server: ec2-54-197-68-252.compute-1.amazonaws.com"
echo "User: dynamtek"
echo ""

# Check if SSH key exists
if [ ! -f ~/Desktop/certificados/labsisapp.pem ]; then
    echo "❌ SSH key not found at: ~/Desktop/certificados/labsisapp.pem"
    echo "   Please check the path and try again."
    exit 1
fi

echo "✅ SSH key found"
echo ""
echo "📝 About to:"
echo "   1. Connect to AWS EC2 server"
echo "   2. Download setup script from GitHub"
echo "   3. Execute automated server setup"
echo ""
echo "⏱️  This will take about 30-40 minutes"
echo ""
echo "Press ENTER to continue or Ctrl+C to cancel..."
read

# Connect and execute setup
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com << 'ENDSSH'
    echo ""
    echo "✅ Connected to server!"
    echo ""
    echo "📥 Downloading setup script from GitHub..."

    # Download the setup script
    curl -o /tmp/setup-server.sh https://raw.githubusercontent.com/saqh5037/laboratorio-eg-system/main/scripts/setup-aws-server.sh

    if [ $? -eq 0 ]; then
        echo "✅ Script downloaded"
        echo ""
        echo "▶️  Executing setup script..."
        echo ""

        # Make executable and run
        chmod +x /tmp/setup-server.sh
        bash /tmp/setup-server.sh

        echo ""
        echo "🎉 Setup complete!"
        echo ""
        echo "📋 Keeping SSH connection open..."
        echo "   You can now configure additional settings or type 'exit' to disconnect"
        echo ""

        # Keep connection open
        bash
    else
        echo "❌ Failed to download setup script"
        echo "   Please check internet connection and try again"
        exit 1
    fi
ENDSSH

echo ""
echo "✅ Disconnected from server"
echo ""
