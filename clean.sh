#!/bin/bash

echo "🧹 Cleaning React Native project..."

rm -rf node_modules
rm -rf android/.cxx
rm -rf android/build
rm -rf android/app/build
rm -rf android/.gradle

yarn install

cd android
./gradlew clean
cd ..

echo "✅ Clean done! You can now run 'npx react-native run-android'"
