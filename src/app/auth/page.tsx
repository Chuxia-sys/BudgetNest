'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, ArrowRight, Sparkles, ShieldCheck, TrendingUp, Target } from 'lucide-react';
import { FirebaseStatus } from '@/components/FirebaseStatus';
import { GoogleSignInDiagnostics } from '@/components/GoogleSignInDiagnostics';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Authentication failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error: any) {
      // Check if it's a popup blocked error
      if (error.message.includes('popup-blocked') || error.message.includes('popup')) {
        toast({
          title: 'Popup Blocked',
          description: 'Please allow popups for this site to use Google Sign-In. Look for the popup blocker icon in your address bar.',
          variant: 'destructive',
        });
      } else if (error.message.includes('unauthorized-domain')) {
        toast({
          title: 'Domain Not Authorized',
          description: 'Please add "chat.z.ai" to Firebase Console → Authentication → Settings → Authorized domains',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Google sign-in failed',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400/20 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative w-full max-w-md px-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 animate-pulse" />
            <div className="relative h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex shadow-xl shadow-purple-500/25">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            Budget Nest
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            {isLogin ? 'Welcome back! Let\'s continue your journey' : 'Start managing your finances smarter today'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin
                ? 'Enter your credentials to access your dashboard'
                : 'Fill in the details below to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base border-2 focus:border-purple-500 transition-colors"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 text-base border-2 focus:border-purple-500 transition-colors"
                    disabled={loading}
                    required
                    minLength={6}
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                {isLogin ? 'Sign up for free' : 'Sign in instead'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-100 dark:border-purple-900/50">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-xs font-medium text-muted-foreground">Track Spending</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-pink-100 dark:border-pink-900/50">
            <Target className="h-6 w-6 mx-auto mb-2 text-pink-500" />
            <p className="text-xs font-medium text-muted-foreground">Set Goals</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-blue-100 dark:border-blue-900/50">
            <ShieldCheck className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-xs font-medium text-muted-foreground">Secure Data</p>
          </div>
        </div>

        {/* Firebase Connection Status */}
        <FirebaseStatus />

        {/* Google Sign-In Diagnostics */}
        <GoogleSignInDiagnostics />

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            Your data is secure and private
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
