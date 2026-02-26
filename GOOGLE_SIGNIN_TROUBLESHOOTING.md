# Google Sign-In Troubleshooting Guide

## Current Setup

Your app is configured with:
- **Firebase Project**: `for-commission`
- **Preview Domain**: `preview-chat-ab6879a5-ca5d-4a2a-81d7-1d58dc07442d.space.z.ai`
- **Auth Provider**: Google (OAuth)

## 🔍 Step-by-Step Verification

### Step 1: Verify Domain is Added to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **for-commission**
3. Navigate to: **Build** → **Authentication** → **Settings** (⚙️)
4. Find **"Authorized domains"** section
5. Verify this domain is in the list:
   ```
   preview-chat-ab6879a5-ca5d-4a2a-81d7-1d58dc07442d.space.z.ai
   ```
6. If not present, click **"Add domain"** and add it
7. Click **"Save"**

### Step 2: Verify Google Sign-In is Enabled

1. Stay in Firebase Console → Authentication
2. Click **"Sign-in method"** tab
3. Find **Google** provider
4. Click on **Google**
5. Ensure it's **Enabled** (toggle is blue)
6. Check the **Project public-facing name** (should be something like "Budget Nest")
7. Check the **Project support email** (should be a valid email)
8. Click **"Save"**

### Step 3: Verify OAuth Consent Screen

If Google Sign-In is disabled or has issues:

1. Go to Firebase Console → Authentication → Sign-in method
2. Click on **Google** provider
3. Click the link to **"Configure"** or go to Google Cloud Console
4. Make sure the **OAuth consent screen** is configured:
   - Application type: **Web application**
   - Authorized redirect URIs should include your domain
5. Save all changes

### Step 4: Check Browser Console for Errors

After trying Google Sign-In:

1. Press **F12** to open browser console
2. Click **Console** tab
3. Look for red error messages
4. Common errors:
   - `auth/unauthorized-domain` - Domain not authorized (fix: add domain to Firebase)
   - `auth/popup-blocked` - Popup blocker enabled (fix: allow popups)
   - `auth/popup-closed-by-user` - User closed popup (normal, not an error)
   - `auth/network-request-failed` - Network issue (check internet)

### Step 5: Test Popup is Not Blocked

1. Check if your browser has a popup blocker enabled
2. Look for popup blocker icon in address bar
3. Click it and allow popups for this site
4. Try Google Sign-In again

## 🛠️ Technical Improvements Made

### Enhanced AuthContext
- ✅ Added comprehensive error handling
- ✅ Implemented popup → redirect fallback
- ✅ Added detailed console logging
- ✅ User-friendly error messages
- ✅ Proper TypeScript error typing

### Google Auth Handler
- ✅ Handles redirect results from Google
- ✅ Automatically redirects to dashboard on success
- ✅ Integrated into app layout

## 🎯 How It Works Now

1. **Primary Method**: Google Sign-In Popup
   - Opens popup window
   - User authenticates with Google
   - Returns user data
   - Signs user in

2. **Fallback Method**: Redirect (if popup blocked)
   - Redirects to Google
   - User authenticates
   - Redirects back to app
   - GoogleAuthHandler processes result
   - Signs user in

3. **Error Handling**:
   - Detects popup blockers
   - Shows user-friendly error messages
   - Logs detailed errors to console
   - Provides clear next steps

## 📋 Checklist to Fix Google Sign-In

- [ ] Domain added to Firebase Auth → Settings → Authorized domains
- [ ] Google provider enabled in Firebase Auth → Sign-in method
- [ ] OAuth consent screen configured in Google Cloud Console
- [ ] Project public-facing name set in Firebase
- [ ] Project support email set in Firebase
- [ ] Browser popup blocker disabled for this site
- [ ] Refreshed the app after making Firebase changes
- [ ] Checked browser console for errors

## 🔧 If Still Not Working

### Test 1: Check Firebase Configuration
Run this in browser console:
```javascript
// Check if Firebase is initialized
import('firebase/auth').then(({ getAuth }) => {
  const auth = getAuth();
  console.log('Auth initialized:', !!auth);
  console.log('Auth config:', auth.config);
});
```

### Test 2: Manual Google Sign-In Test
Run this in browser console:
```javascript
import('firebase/auth').then(async ({ getAuth, signInWithPopup, GoogleAuthProvider }) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Sign in successful!', result.user);
  } catch (error) {
    console.error('Sign in failed:', error.code, error.message);
  }
});
```

### Test 3: Verify Domain is Correct
The exact domain that needs to be added is:
```
preview-chat-ab6879a5-ca5d-4a2a-81d7-1d58dc07442d.space.z.ai
```

Copy this exactly (no trailing slash, no http:// or https://)

## 📞 Last Resort

If all else fails:

1. **Recreate Google Provider**:
   - Disable Google provider in Firebase
   - Wait 30 seconds
   - Re-enable Google provider
   - Re-add authorized domain
   - Save changes

2. **Create New Firebase Project** (for production):
   - Create a new Firebase project
   - Set up Authentication with Google
   - Add all authorized domains
   - Update `.env` with new Firebase config

3. **Check Firebase Quotas**:
   - Go to Firebase Console → Usage & Billing
   - Check if you've exceeded any limits
   - Verify project is not in read-only mode

## ✅ Success Indicators

When Google Sign-In is working, you should see:
1. Google popup opens
2. You see Google account selection
3. You grant permissions
4. Popup closes
5. You're redirected to dashboard
6. Console shows: "Google Sign-In successful with popup"
7. User is logged in with their Google account
