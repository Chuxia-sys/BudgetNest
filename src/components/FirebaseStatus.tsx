'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';

/**
 * Firebase Connection Test Component
 * Shows the status of Firebase Auth connection
 */
export function FirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authConfig, setAuthConfig] = useState<any>(null);

  const checkFirebaseConnection = () => {
    setStatus('checking');
    console.log('Checking Firebase connection...');

    try {
      const authInstance = getAuth();
      console.log('Auth instance:', authInstance);
      console.log('Auth config:', authInstance.config);

      setAuthConfig({
        apiKey: authInstance.config.apiKey ? '✅ Set' : '❌ Missing',
        authDomain: authInstance.config.authDomain || '❌ Missing',
        projectId: authInstance.config.projectId || '❌ Missing',
        appId: authInstance.config.appId ? '✅ Set' : '❌ Missing',
      });

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        console.log('Auth state:', user ? user.email : 'No user');
        if (user) {
          setUserEmail(user.email);
          setStatus('connected');
        } else {
          setUserEmail(null);
          setStatus('connected'); // Connected but no user
        }
      }, (error) => {
        console.error('Auth error:', error);
        setStatus('disconnected');
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase connection error:', error);
      setStatus('disconnected');
    }
  };

  useEffect(() => {
    checkFirebaseConnection();
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'checking' && <Loader2 className="h-5 w-5 animate-spin" />}
          {status === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === 'disconnected' && <XCircle className="h-5 w-5 text-red-500" />}
          Firebase Connection Status
        </CardTitle>
        <CardDescription>
          {status === 'checking' && 'Checking Firebase connection...'}
          {status === 'connected' && 'Firebase is connected and working'}
          {status === 'disconnected' && 'Firebase connection failed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userEmail && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              ✅ Currently signed in as: {userEmail}
            </p>
          </div>
        )}

        {authConfig && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Firebase Configuration:</p>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Key:</span>
                <span>{authConfig.apiKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auth Domain:</span>
                <span>{authConfig.authDomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project ID:</span>
                <span>{authConfig.projectId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">App ID:</span>
                <span>{authConfig.appId}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={checkFirebaseConnection}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Recheck Connection
        </Button>
      </CardContent>
    </Card>
  );
}
