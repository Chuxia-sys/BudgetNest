# Firebase Google Sign-In Setup Guide

## ✅ Fixes Applied

The following issues have been fixed in your codebase:

1. **Google OAuth Provider Configuration** - Properly configured with correct OAuth scopes
2. **Popup & Redirect Handling** - Improved error handling with automatic fallback
3. **Redirect Result Processing** - Added support for handling Google Sign-In redirects
4. **Firebase Validation** - Added configuration validation with helpful warnings
5. **Better Error Messages** - User-friendly error messages for common issues

## 🔧 Required Setup Steps

### Step 1: Configure Firebase Environment Variables

1. Open the file: `.env.local` in the root of your project
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project (or create a new one)
4. Click the gear icon ⚙️ → **Project Settings**
5. Scroll down to **"Your apps"** section
6. If you don't have a web app:
   - Click **"Add app"** → Select Web (</>) icon
   - Register your app with a nickname
7. Copy the configuration values and replace them in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
```

### Step 2: Enable Google Sign-In in Firebase

1. In Firebase Console, go to **Build** → **Authentication**
2. Click the **"Sign-in method"** tab
3. Find **"Google"** in the providers list
4. Click on **Google**
5. Toggle the **"Enable"** switch (turn it blue)
6. Set **"Project public-facing name"** (e.g., "Budget Nest")
7. Set **"Project support email"** (use your email)
8. Click **"Save"**

### Step 3: Add Authorized Domains

1. Still in Firebase Console → **Authentication**
2. Click the **"Settings"** tab (⚙️ icon)
3. Scroll to **"Authorized domains"** section
4. You should see `localhost` already added
5. Click **"Add domain"** and add your production domain(s):
   - Example: `your-app.vercel.app`
   - Example: `your-custom-domain.com`
   - Example: `preview-chat-*.space.z.ai` (for Z.ai deployments)
6. Click **"Add"** for each domain

**Important:** Any domain where you deploy your app must be added here!

### Step 4: Configure OAuth Consent Screen (if needed)

If you see errors about OAuth consent screen:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Fill in required fields:
   - App name
   - User support email
   - Developer contact email
5. Add scopes (if asked):
   - `userinfo.email`
   - `userinfo.profile`
6. Save and continue

### Step 5: Test Google Sign-In

1. Start your development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

2. Navigate to the login page: `http://localhost:3000/auth`

3. Click **"Continue with Google"** button

4. You should see Google's account selector popup

5. Select your Google account

6. You should be redirected to the dashboard

## 🐛 Troubleshooting

### Error: "auth/unauthorized-domain"

**Solution:** Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### Error: "auth/popup-blocked"

**Cause:** Browser blocked the popup window

**Solution:** 
- Look for popup blocker icon in address bar
- Click it and allow popups for this site
- The app will automatically try redirect method as fallback

### Error: "auth/invalid-api-key"

**Cause:** Incorrect Firebase API key in `.env.local`

**Solution:** 
- Double-check your API key from Firebase Console
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env.local`

### Error: "No user after sign-in"

**Cause:** Session not persisting

**Solution:**
- Clear browser cache and cookies
- Check browser console for errors
- Verify Firebase configuration is correct

### Popup doesn't appear

**Possible causes:**
1. Popup blocker is enabled
2. Domain not authorized in Firebase
3. Google Sign-In not enabled in Firebase Console

**Check:**
- Browser console (F12) for error messages
- Firebase Console → Authentication → Sign-in method → Google is enabled
- Domain is added to authorized domains

## 🔍 Debugging

### Check Browser Console

Press **F12** to open browser developer tools, then:

1. Click the **"Console"** tab
2. Look for messages starting with:
   - `🚀` - Sign-in process started
   - `✅` - Success messages
   - `❌` - Error messages
   - `⚠️` - Warnings

### Check Firebase Configuration

The app will automatically log warnings if your Firebase configuration is incomplete:

```
⚠️ Firebase configuration incomplete. Missing or using default values for: ...
```

If you see this, update your `.env.local` file with real Firebase credentials.

## 📝 Notes

- **Environment Variables:** Must start with `NEXT_PUBLIC_` to be available in the browser
- **Restart Required:** Restart dev server after changing `.env.local`
- **Security:** Never commit `.env.local` to version control
- **Production:** Make sure to set environment variables in your deployment platform (Vercel, Netlify, etc.)

## ✨ What Was Fixed

### Updated Files:

1. **`src/contexts/AuthContext.tsx`**
   - Fixed Google OAuth provider configuration
   - Added proper OAuth scopes
   - Improved error handling with specific messages
   - Added redirect result handling
   - Better logging for debugging

2. **`src/lib/firebase.ts`**
   - Added Firebase configuration validation
   - Better error handling on initialization
   - Helpful console warnings for missing config
   - Improved logging

3. **`.env.local`** (created)
   - Template with all required environment variables
   - Instructions for getting Firebase credentials

## 🎯 Next Steps

1. **Update `.env.local`** with your actual Firebase credentials
2. **Enable Google Sign-In** in Firebase Console
3. **Add your domains** to Firebase authorized domains
4. **Test the login** - it should work now!

If you encounter any issues, check the browser console for detailed error messages and refer to the Troubleshooting section above.
