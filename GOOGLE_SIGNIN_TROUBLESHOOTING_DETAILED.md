# Google Sign-In Troubleshooting Guide

## 🔴 Issue: Google Sign-In Won't Work

### Current Status:
- Domain `chat.z.ai` is supposedly added to Firebase
- Error: `auth/popup-blocked` (popup is being blocked by browser)
- Code automatically tries redirect method but user says it "won't work"

---

## 🔍 Step 1: Run Diagnostics

1. Go to the auth/login page
2. Scroll down to **"Google Sign-In Diagnostics"**
3. Click **"Run Diagnostics"** button
4. Review all test results
5. **Take a screenshot** and share it if you need help

---

## 🔧 Step 2: Manual Browser Console Test

1. Press **F12** to open browser console
2. Go to the **Console** tab
3. Copy the test script from: `/public/test-google-signin.js`
4. Paste it in the console
5. Press **Enter**
6. Read the results and follow any instructions

---

## 🔧 Step 3: Allow Popups (Most Likely Fix)

### Chrome/Edge:
1. Look for popup blocker icon (🚫) in address bar
2. Click it
3. Select **"Always allow popups and redirects from chat.z.ai"**
4. Click **"Done"**
5. Refresh page (Ctrl+Shift+R)
6. Try Google Sign-In again

### Firefox:
1. Click **≡** menu → **Settings**
2. Click **"Privacy & Security"**
3. Scroll to **"Permissions"**
4. Find **"Block pop-up windows"**
5. Click **"Exceptions"**
6. Add `chat.z.ai` and set to **"Allow"**
7. Refresh and try again

### Safari:
1. **Safari** → **Settings** → **Websites**
2. Click **"Pop-up Windows"**
3. Find **chat.z.ai** and set to **"Allow"**
4. Refresh and try again

---

## 🔧 Step 4: Verify Firebase Configuration

### Check 1: Authorized Domains
1. Firebase Console → **Build** → **Authentication** → **Settings** (⚙️)
2. Scroll to **"Authorized domains"**
3. Confirm you see: `chat.z.ai`
4. If not there, add it
5. Click **"Save"**

### Check 2: Google Provider
1. Firebase Console → **Build** → **Authentication** → **"Sign-in method"**
2. Click **"Google"**
3. Ensure toggle is **blue** (enabled)
4. Check **"Project public-facing name"** (e.g., "Budget Nest")
5. Check **"Project support email"** (must be a valid email)
6. Click **"Save"**

### Check 3: OAuth Consent Screen
1. Firebase Console → **Build** → **Authentication** → **"Sign-in method"**
2. Click **"Google"**
3. Click the link to **"Configure"** or go to Google Cloud Console
4. Verify OAuth consent screen is configured
5. Application type: **Web application**
6. Authorized redirect URIs should include:
   - `https://chat.z.ai`
   - `https://chat.z.ai/__/auth/handler`
7. Save all changes

---

## 🔧 Step 5: Clear Cache and Refresh

1. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E
2. Select **"Cached images and files"**
3. Click **"Clear data"**
4. **Hard refresh**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
5. Try Google Sign-In again

---

## 🔧 Step 6: Try Different Browser

If it still doesn't work, try:
1. **Chrome** (if you're using Firefox)
2. **Firefox** (if you're using Chrome)
3. **Edge** (if you're using Safari)
4. **Incognito/Private mode** (to rule out extensions)

---

## 🔧 Step 7: Check Browser Extensions

Some browser extensions can block Google Sign-In:

1. Open **Incognito/Private mode** (extensions are disabled)
2. Try Google Sign-In
3. If it works in incognito, disable extensions one by one to find the culprit

Common problematic extensions:
- Ad blockers
- Privacy blockers
- Popup blockers
- Security extensions

---

## 🔧 Step 8: Verify Network Connection

1. Check you have internet connection
2. Try accessing: https://accounts.google.com
3. If Google is blocked, you can't use Google Sign-In
4. Try a different network (e.g., mobile hotspot)

---

## 🔧 Step 9: Check for IP Restrictions

Some organizations or countries block Google services:

1. Are you at work/school?
2. Are you in a country with internet restrictions?
3. Try using a VPN if possible

---

## 📊 Expected Behavior

### When Working Correctly:

**With Popup Allowed:**
```
User clicks Google button
  ↓
Popup opens with Google account selection
  ↓
User selects account
  ↓
Popup closes
  ↓
User is signed in and redirected to dashboard
```

**With Popup Blocked:**
```
User clicks Google button
  ↓
Popup is blocked by browser
  ↓
Code automatically tries redirect method
  ↓
Page redirects to Google
  ↓
User selects account
  ↓
Page redirects back to app
  ↓
User is automatically signed in
```

---

## 🎯 Quick Checklist

- [ ] Ran diagnostics (scroll down to "Google Sign-In Diagnostics")
- [ ] Allowed popups for `chat.z.ai` in browser settings
- [ ] Verified `chat.z.ai` is in Firebase → Auth → Settings → Authorized domains
- [ ] Verified Google provider is enabled in Firebase
- [ ] Verified OAuth consent screen is configured
- [ ] Cleared browser cache and refreshed
- [ ] Tried in different browser
- [ ] Tried in incognito/private mode
- [ ] Checked for blocking browser extensions
- [ ] Verified internet connection
- [ ] Waited 2-3 minutes after Firebase changes

---

## 📞 If Still Not Working

### Information Needed for Further Help:

1. **Screenshot of diagnostics results** (from "Google Sign-In Diagnostics" card)
2. **Screenshot of Firebase Console** showing:
   - Authorized domains list
   - Google provider settings
3. **Screenshot of browser console** (F12) after clicking Google button
4. **Browser name and version** (e.g., Chrome 120, Firefox 121)
5. **Are you using incognito/private mode?**
6. **Are there any browser extensions installed?**

---

## 🆘 Emergency Fallback

If Google Sign-In absolutely won't work, you can still sign up/sign in with **email and password**:

1. Enter your email
2. Create a password (min 6 characters)
3. Click **"Create Account"** or **"Sign In"**
4. You'll have full access to all features!

---

## ✅ Success Indicators

When Google Sign-In is working, you should see in console:

```
Google Sign-In initiated...
Attempting Google Sign-In with popup...
✅ Google Sign-In successful with popup: your-email@gmail.com
Auth state changed: User: your-email@gmail.com
✅ User signed in: your-email@gmail.com
```

And you should be automatically redirected to the dashboard!
