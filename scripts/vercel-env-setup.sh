#!/bin/bash

# Script to add environment variables to Vercel
# Make sure you have Vercel CLI installed: npm i -g vercel

echo "Setting up environment variables for Vercel..."

# Add each environment variable
vercel env add REACT_APP_FIREBASE_API_KEY production < <(echo "AIzaSyAEtA8Q_nMUXGYwgXj3SrPiREGAetKX8jQ")
vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN production < <(echo "yambo-studio-dashboard-v1.firebaseapp.com")
vercel env add REACT_APP_FIREBASE_DATABASE_URL production < <(echo "https://yambo-studio-dashboard-v1-default-rtdb.europe-west1.firebasedatabase.app")
vercel env add REACT_APP_FIREBASE_PROJECT_ID production < <(echo "yambo-studio-dashboard-v1")
vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET production < <(echo "yambo-studio-dashboard-v1.appspot.com")
vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID production < <(echo "961203853384")
vercel env add REACT_APP_FIREBASE_APP_ID production < <(echo "1:961203853384:web:b0f26f89b3808e5f63207d")

echo "Environment variables added! You need to redeploy for changes to take effect."
echo "Run: vercel --prod"