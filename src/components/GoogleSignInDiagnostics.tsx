'use client';

import { useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Loader2, Play, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/**
 * Comprehensive Google Sign-In Diagnostic Tool
 */
export function GoogleSignInDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    details?: string;
  }>>([]);

  const addResult = (test: string, status: 'success' | 'error', message: string, details?: string) => {
    setResults(prev => [...prev, { test, status, message, details }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Check Firebase Auth initialization
      addResult('Firebase Auth', 'pending', 'Checking Firebase Auth initialization...');
      const testAuth = getAuth();
      if (testAuth) {
        addResult('Firebase Auth', 'success', 'Firebase Auth initialized', `App name: ${testAuth.app.name || 'N/A'}`);
      } else {
        addResult('Firebase Auth', 'error', 'Firebase Auth not initialized');
        return;
      }

      // Test 2: Check Firebase Config
      addResult('Firebase Config', 'pending', 'Checking Firebase configuration...');
      const config = testAuth.config;
      if (config.apiKey && config.projectId && config.appId) {
        addResult('Firebase Config', 'success', 'Firebase configuration is valid', `Project: ${config.projectId}`);
      } else {
        addResult('Firebase Config', 'error', 'Firebase configuration is incomplete', `Missing: ${!config.apiKey ? 'API Key ' : ''}${!config.projectId ? 'Project ID ' : ''}${!config.appId ? 'App ID' : ''}`);
        return;
      }

      // Test 3: Check Auth Domain
      addResult('Auth Domain', 'pending', 'Checking auth domain...');
      if (config.authDomain) {
        addResult('Auth Domain', 'success', 'Auth domain is set', config.authDomain);
      } else {
        addResult('Auth Domain', 'error', 'Auth domain is missing');
        return;
      }

      // Test 4: Test Google Provider Creation
      addResult('Google Provider', 'pending', 'Testing Google Provider creation...');
      try {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        addResult('Google Provider', 'success', 'Google Provider created successfully');
      } catch (error: any) {
        addResult('Google Provider', 'error', 'Failed to create Google Provider', error.message);
        return;
      }

      // Test 5: Check Current Auth State
      addResult('Auth State', 'pending', 'Checking current auth state...');
      const currentUser = testAuth.currentUser;
      if (currentUser) {
        addResult('Auth State', 'success', 'User is signed in', `Email: ${currentUser.email || 'N/A'}`);
      } else {
        addResult('Auth State', 'success', 'No user signed in (this is normal)');
      }

      // Test 6: Test Redirect Result
      addResult('Redirect Result', 'pending', 'Checking for pending redirect result...');
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) {
          addResult('Redirect Result', 'success', 'Pending redirect found', `User: ${redirectResult.user.email}`);
        } else {
          addResult('Redirect Result', 'success', 'No pending redirect (normal)');
        }
      } catch (error: any) {
        if (error.code === 'auth/no-pending-credential') {
          addResult('Redirect Result', 'success', 'No pending redirect (normal)');
        } else {
          addResult('Redirect Result', 'error', 'Error checking redirect result', `${error.code}: ${error.message}`);
        }
      }

      // Test 7: Manual Popup Test (with warning)
      addResult('Popup Test', 'pending', 'Testing popup method...');
      try {
        const testProvider = new GoogleAuthProvider();
        testProvider.setCustomParameters({ prompt: 'none' }); // Will fail fast
        await signInWithPopup(testAuth, testProvider);
        addResult('Popup Test', 'success', 'Popup test passed');
      } catch (error: any) {
        if (error.code === 'auth/popup-blocked') {
          addResult('Popup Test', 'error', 'Popup blocked by browser', 'Please allow popups for this site');
        } else if (error.code === 'auth/cancelled-popup-request') {
          addResult('Popup Test', 'error', 'Popup was cancelled');
        } else if (error.code === 'auth/unauthorized-domain') {
          addResult('Popup Test', 'error', 'Domain not authorized', 'Domain: chat.z.ai - Make sure this is added to Firebase Console → Authentication → Settings → Authorized domains');
        } else {
          addResult('Popup Test', 'error', 'Popup test failed', `${error.code}: ${error.message}`);
        }
      }

      // Summary
      const errors = results.filter(r => r.status === 'error');
      const criticalErrors = errors.filter(e => !e.message.includes('popup-blocked') && !e.message.includes('cancelled'));

      if (criticalErrors.length === 0) {
        toast({
          title: 'Diagnostics Complete',
          description: errors.length > 0 ? 'Some non-critical issues found. See results below.' : 'All checks passed!',
          variant: errors.length > 0 ? 'default' : 'default',
        });
      } else {
        toast({
          title: 'Critical Issues Found',
          description: `${criticalErrors.length} critical error(s) need to be fixed`,
          variant: 'destructive',
        });
      }

    } catch (error: any) {
      addResult('Diagnostics', 'error', 'Diagnostics failed', error.message);
      toast({
        title: 'Diagnostics Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="mt-6 border-2 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <ExternalLink className="h-5 w-5" />
          Google Sign-In Diagnostics
        </CardTitle>
        <CardDescription>
          Run comprehensive diagnostics to identify Google Sign-In issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
          <Button
            onClick={clearResults}
            variant="outline"
            disabled={isRunning || results.length === 0}
          >
            Clear
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-medium">Test Results:</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : result.status === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />}
                    {result.status === 'error' && <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />}
                    {result.status === 'pending' && <Loader2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0 animate-spin" />}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{result.test}</p>
                      <p className="text-xs text-muted-foreground mt-1">{result.message}</p>
                      {result.details && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono bg-black/5 dark:bg-white/5 p-2 rounded">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Troubleshooting Steps:
          </p>
          <ol className="text-xs text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-decimal list-inside">
            <li>Run diagnostics above</li>
            <li>If "Popup blocked" appears, allow popups for this site</li>
            <li>If "Domain not authorized" appears, verify chat.z.ai is in Firebase Console</li>
            <li>Wait 2-3 minutes for Firebase changes to propagate</li>
            <li>Refresh the page and try again</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
