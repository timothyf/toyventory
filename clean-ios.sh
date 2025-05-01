#!/bin/bash

echo "🧼 Cleaning React Native iOS build environment..."

# Close Xcode if it's running
osascript -e 'quit app "Xcode"' 2>/dev/null

# Delete iOS build artifacts
echo "🗑  Removing iOS build folders..."
rm -rf ios/build
rm -rf ios/Pods
rm -f ios/Podfile.lock

# Clear Derived Data
echo "🗑  Removing Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reinstall CocoaPods
echo "📦 Installing CocoaPods..."
cd ios || exit 1
pod install

# Return to root
cd ..

# Clear Metro bundler cache
echo "♻️  Resetting Metro cache..."
rm -rf node_modules
rm -f package-lock.json
npm install
npx react-native start --reset-cache

echo "✅ Clean complete. Now run:"
echo "   ▶️  npx react-native run-ios"
