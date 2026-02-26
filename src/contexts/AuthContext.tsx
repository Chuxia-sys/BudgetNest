'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  AuthError,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log('AuthContext: Setting up auth state listener...');

    const initializeAuth = async () => {
      try {
        // Set persistence to local (survives browser restarts)
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Auth persistence configured');
      } catch (error) {
        console.error('⚠️ Failed to set persistence:', error);
      }

      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (!isMounted) return;

          console.log('Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');

          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
            console.log('✅ User signed in:', firebaseUser.email);
          } else {
            setUser(null);
            console.log('ℹ️ User signed out');
          }
          setLoading(false);
          setInitialized(true);
        },
        (error) => {
          if (!isMounted) return;
          console.error('❌ Auth state change error:', error);
          setLoading(false);
          setInitialized(true);
        }
      );

      return unsubscribe;
    };

    const unsubscribePromise = initializeAuth();
    console.log('Auth context initialized successfully');

    return () => {
      isMounted = false;
      unsubscribePromise.then(unsub => unsub?.());
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign in error:', authError.code, authError.message);
      throw new Error(getAuthErrorMessage(authError.code));
    }
  };

  const signInWithGoogle = async () => {
    console.log('🚀 Google Sign-In initiated...');

    const provider = new GoogleAuthProvider();
    
    // Configure OAuth provider with proper scopes (using shorthand)
    provider.addScope('email');
    provider.addScope('profile');
    
    // Set custom parameters for better UX
    provider.setCustomParameters({
      prompt: 'select_account' // Always show account selector
    });

    try {
      console.log('🔐 Attempting Google Sign-In with popup...');
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        console.log('✅ Google Sign-In successful:', result.user.email);
      }
      
      return; // Success, onAuthStateChanged will update user state
    } catch (error) {
      const authError = error as AuthError;
      console.error('❌ Google Sign-In error:', authError.code);

      // Handle popup blocked - try redirect as fallback
      if (authError.code === 'auth/popup-blocked') {
        console.log('⚠️ Popup blocked, switching to redirect method...');
        
        try {
          await signInWithRedirect(auth, provider);
          console.log('🔄 Redirecting to Google...');
          // User will be redirected, GoogleAuthHandler will handle the result
          return;
        } catch (redirectError) {
          const redirectAuthError = redirectError as AuthError;
          console.error('❌ Redirect error:', redirectAuthError.code);
          throw new Error(getAuthErrorMessage(redirectAuthError.code));
        }
      }

      // Handle cancelled sign-in (user closed popup)
      if (authError.code === 'auth/popup-closed-by-user' || 
          authError.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ Sign-in cancelled by user');
        throw new Error('Sign-in was cancelled');
      }

      // Handle unauthorized domain
      if (authError.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
        console.error('⚠️ Domain not authorized:', domain);
        throw new Error(
          `Domain "${domain}" is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains`
        );
      }

      // Provide user-friendly error message for all other errors
      throw new Error(getAuthErrorMessage(authError.code));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign up error:', authError.code, authError.message);
      throw new Error(getAuthErrorMessage(authError.code));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign out error:', authError.code, authError.message);
      throw new Error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to provide user-friendly error messages
function getAuthErrorMessage(code: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/invalid-email': 'Invalid email address format',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site',
    'auth/popup-closed-by-user': 'Sign-in was cancelled',
    'auth/cancelled-popup-request': 'Sign-in was cancelled',
    'auth/unauthorized-domain': 'This domain is not authorized for Google Sign-In. Please add it to Firebase Console.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method',
    'auth/invalid-credential': 'Invalid credentials',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled',
    'auth/invalid-api-key': 'Invalid API key. Please check your Firebase configuration.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
  };

  return errorMessages[code] || `Authentication error: ${code}`;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
