# Vercel Environment Variables Setup

**⚠️ CRITICAL: All variables must be set correctly for the app to work!**

Copy and paste these environment variables into your Vercel project settings:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each of these variables:

**IMPORTANT**: The database URL must be EXACTLY as shown below (including region):

```
REACT_APP_FIREBASE_API_KEY=AIzaSyAEtA8Q_nMUXGYwgXj3SrPiREGAetKX8jQ
REACT_APP_FIREBASE_AUTH_DOMAIN=yambo-studio-dashboard-v1.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://yambo-studio-dashboard-v1-default-rtdb.europe-west1.firebasedatabase.app/
REACT_APP_FIREBASE_PROJECT_ID=yambo-studio-dashboard-v1
REACT_APP_FIREBASE_STORAGE_BUCKET=yambo-studio-dashboard-v1.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=961203853384
REACT_APP_FIREBASE_APP_ID=1:961203853384:web:b0f26f89b3808e5f63207d
```

## Steps for each variable:
1. Click "Add New"
2. Enter the variable name (e.g., REACT_APP_FIREBASE_API_KEY)
3. Enter the value
4. Select environments: ✓ Production, ✓ Preview, ✓ Development
5. Click "Save"

## After adding all variables:
1. Go to your project's deployments
2. Click on the three dots menu on the latest deployment
3. Select "Redeploy"
4. Confirm the redeployment

This will make the environment variables available to your production build.

## Troubleshooting:
- If you see "Database lives in a different region" error, double-check the database URL
- If data doesn't load, verify ALL environment variables are set correctly
- Always redeploy after changing environment variables