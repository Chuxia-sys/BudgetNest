# Quick Start Checklist ✅

Use this checklist to get Google Sign-In working in your BudgetNest app.

## Prerequisites
- [ ] You have a Google account
- [ ] You have access to [Firebase Console](https://console.firebase.google.com/)

## Setup Steps

### 1️⃣ Firebase Console Setup (5 minutes)

- [ ] Go to https://console.firebase.google.com/
- [ ] Create a project OR select existing project
- [ ] Click ⚙️ (gear icon) → Project Settings
- [ ] Scroll to "Your apps" section
- [ ] Click "Add app" → Select Web (</>)
- [ ] Register your app (give it any nickname)
- [ ] Copy the Firebase config values (keep this tab open)

### 2️⃣ Local Environment Setup (2 minutes)

- [ ] Open `.env.local` file in your project root
- [ ] Replace ALL placeholder values with your Firebase config:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] Save the file

### 3️⃣ Enable Google Sign-In (2 minutes)

- [ ] In Firebase Console, go to **Build** → **Authentication**
- [ ] Click **"Get Started"** (if first time)
- [ ] Click **"Sign-in method"** tab
- [ ] Find **Google** in the list
- [ ] Click on **Google**
- [ ] Toggle **"Enable"** to ON (blue)
- [ ] Enter **Project support email** (your email)
- [ ] Click **"Save"**

### 4️⃣ Add Authorized Domains (1 minute)

- [ ] Still in Authentication section
- [ ] Click **"Settings"** tab
- [ ] Scroll to **"Authorized domains"**
- [ ] Verify `localhost` is in the list
- [ ] For production, add your domain:
  - [ ] Click **"Add domain"**
  - [ ] Enter your domain (e.g., `your-app.vercel.app`)
  - [ ] Click **"Add"**

### 5️⃣ Test It! (1 minute)

- [ ] Open terminal in project directory
- [ ] Run: `npm run dev` or `bun run dev`
- [ ] Wait for "Ready" message
- [ ] Open browser to `http://localhost:3000/auth`
- [ ] Click **"Continue with Google"** button
- [ ] Select your Google account
- [ ] ✅ You should be signed in!

## Verification

After testing, you should see:

- [ ] Google account selector popup appears
- [ ] After selecting account, you're redirected to dashboard
- [ ] Your name/email appears in the app header
- [ ] No errors in browser console (F12 → Console tab)

## If It Doesn't Work

### Check Browser Console (F12 → Console)

Look for error messages:

**"auth/unauthorized-domain"**
→ Go back to Step 4️⃣ and add your domain

**"auth/invalid-api-key"**
→ Go back to Step 2️⃣ and verify API key is correct

**"auth/popup-blocked"**
→ Allow popups in browser settings (look for icon in address bar)

**"Firebase configuration incomplete"**
→ Go back to Step 2️⃣ and ensure ALL values are replaced

### Still Having Issues?

1. **Restart dev server** after changing `.env.local`
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Check Firebase Console** for any error messages
4. **Review the detailed guide**: `FIREBASE_GOOGLE_SIGNIN_SETUP.md`

## Common Mistakes ⚠️

- ❌ Forgetting to restart dev server after editing `.env.local`
- ❌ Not enabling Google provider in Firebase Console
- ❌ Not adding domain to authorized domains
- ❌ Copying config values incorrectly (with quotes or spaces)
- ❌ Using demo/placeholder values instead of real Firebase config

## Need Help?

Read the detailed setup guide: `FIREBASE_GOOGLE_SIGNIN_SETUP.md`

---

**Estimated Total Time:** 10-15 minutes

**Once completed, Google Sign-In will be fully functional!** 🎉
