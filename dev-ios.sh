#!/bin/bash

echo "🧼 Checking for Metro server..."
METRO_RUNNING=$(lsof -i :8081 | grep LISTEN)

if [ -z "$METRO_RUNNING" ]; then
  echo "🚀 Starting Metro bundler..."
  npx react-native start --reset-cache &
  sleep 5
else
  echo "✅ Metro is already running."
fi

echo "🧠 Launching app in iOS Simulator (via Xcode)..."
open ios/*.xcworkspace

echo ""
echo "👉 In Xcode:"
echo "   - Select a simulator (e.g., iPhone 14)"
echo "   - Press ⌘ + R to run without full rebuild"
echo ""
echo "💡 Use this script again anytime you need a fast startup."
