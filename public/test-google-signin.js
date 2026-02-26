/**
 * Manual Google Sign-In Test Script
 * Run this in the browser console to test Google Sign-In manually
 *
 * Instructions:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter to run
 * 4. Follow the prompts
 */

(async function testGoogleSignIn() {
  console.log('🧪 Starting Google Sign-In Manual Test...\n');

  try {
    // Import Firebase modules
    const { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');

    console.log('✅ Firebase modules imported\n');

    // Test 1: Check Auth Instance
    console.log('Test 1: Checking Auth Instance...');
    const testAuth = getAuth();
    console.log('   Auth instance:', testAuth);
    console.log('   Config:', {
      apiKey: testAuth.config.apiKey,
      authDomain: testAuth.config.authDomain,
      projectId: testAuth.config.projectId,
      appId: testAuth.config.appId,
    });
    console.log('   ✅ Auth instance is valid\n');

    // Test 2: Check Current User
    console.log('Test 2: Checking current user...');
    const currentUser = testAuth.currentUser;
    console.log('   Current user:', currentUser ? currentUser.email : 'No user signed in');
    console.log('   ✅ User check complete\n');

    // Test 3: Try Popup Method
    console.log('Test 3: Testing Popup Method...');
    console.log('   ⚠️  A popup window will open. Please allow it!\n');

    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      console.log('   ✅ SUCCESS! Google Sign-In worked!');
      console.log('   User:', result.user.email);
      console.log('   User ID:', result.user.uid);
      console.log('   Display Name:', result.user.displayName);
      console.log('   Photo URL:', result.user.photoURL);
      console.log('\n🎉 Google Sign-In is working correctly!');
    } catch (error) {
      console.log('   ❌ Popup method failed');
      console.log('   Error code:', error.code);
      console.log('   Error message:', error.message);

      if (error.code === 'auth/popup-blocked') {
        console.log('\n⚠️  POPUP BLOCKED');
        console.log('   Solution: Allow popups for this site in your browser settings');
      } else if (error.code === 'auth/unauthorized-domain') {
        console.log('\n⚠️  DOMAIN NOT AUTHORIZED');
        console.log('   Current domain:', window.location.hostname);
        console.log('   Solution: Add "' + window.location.hostname + '" to Firebase Console → Authentication → Settings → Authorized domains');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('\n⚠️  POPUP CLOSED BY USER');
        console.log('   This is normal if you closed the popup window');
      }

      // Test 4: Try Redirect Method as fallback
      console.log('\nTest 4: Testing Redirect Method as fallback...');
      try {
        await signInWithRedirect(auth, provider);
        console.log('   ✅ Redirect initiated successfully');
        console.log('   You will be redirected to Google...');
      } catch (redirectError) {
        console.log('   ❌ Redirect method also failed');
        console.log('   Error:', redirectError.code, redirectError.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
})();

console.log('📝 To run this test again, copy and paste the script above');
