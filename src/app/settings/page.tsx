'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { UserSettings } from '@/types';
import { Settings as SettingsIcon, CircleDollarSign, Bell, Palette, Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { processImageForStorage, isValidBase64Image } from '@/lib/imageUtils';

const CURRENCIES = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    spendingLimit: 50000,
    notificationsEnabled: true,
    currency: 'PHP',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    const res = await fetch(`/api/settings?uid=${user.uid}`);
    const data = await res.json();
    if (data.settings) {
      setSettings(data.settings);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          ...settings,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Settings save error:', errorData);
        throw new Error(errorData.error || `Failed to save settings (${res.status})`);
      }

      toast({
        title: 'Success',
        description: 'Settings saved successfully!',
      });
    } catch (error: any) {
      console.error('Save settings error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg sm:text-xl">Budget Settings</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Set your monthly spending limit to help you stay on track
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spendingLimit">Monthly Spending Limit</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                {CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$'}
              </span>
              <Input
                id="spendingLimit"
                type="number"
                step="0.01"
                min="0"
                value={settings.spendingLimit}
                onChange={(e) => setSettings({ ...settings, spendingLimit: parseFloat(e.target.value) || 0 })}
                className="pl-8 text-lg"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You'll receive alerts when you reach 80% and 100% of this limit
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg sm:text-xl">Notifications</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Manage how and when you receive spending alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="notifications">Spending Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you approach your spending limit
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
            />
          </div>
          
          <Separator />

          <div className="space-y-2">
            <Label>Alert Thresholds</Label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-muted-foreground">Warning Alert</span>
                <span className="font-medium">80% of budget</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-muted-foreground">Critical Alert</span>
                <span className="font-medium">100% of budget</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg sm:text-xl">Profile Picture</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Set your profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                {settings.profilePicture ? (
                  <img 
                    src={settings.profilePicture} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setIsUploadingPicture(true);
                  try {
                    // Process and compress the image
                    const result = await processImageForStorage(file, 400, 400, 0.85);

                    if (!result.success) {
                      toast({
                        title: 'Error',
                        description: result.error || 'Failed to process image',
                        variant: 'destructive',
                      });
                      setIsUploadingPicture(false);
                      return;
                    }

                    // Validate the base64 string
                    if (!isValidBase64Image(result.base64!)) {
                      toast({
                        title: 'Error',
                        description: 'Invalid image format',
                        variant: 'destructive',
                      });
                      setIsUploadingPicture(false);
                      return;
                    }

                    // Update settings with the processed image
                    setSettings({ ...settings, profilePicture: result.base64 });
                    toast({
                      title: 'Success',
                      description: 'Image uploaded successfully! Click "Save Settings" to save it.',
                    });
                  } catch (error) {
                    console.error('Image upload error:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to process image',
                      variant: 'destructive',
                    });
                  } finally {
                    setIsUploadingPicture(false);
                    // Reset the file input
                    e.target.value = '';
                  }
                }}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('profile-picture')?.click()}
                  disabled={isUploadingPicture}
                  className="w-full sm:w-auto"
                >
                  {isUploadingPicture ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Picture'
                  )}
                </Button>
                {settings.profilePicture && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSettings({ ...settings, profilePicture: undefined })}
                    className="w-full sm:w-auto"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Accepted formats: JPG, PNG, GIF, WebP. Max size: 5MB (auto-compressed)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg sm:text-xl">Appearance</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Customize the look and feel of Budget Nest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => setSettings({ ...settings, currency: value })}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-muted-foreground">- {currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email || ''} disabled className="bg-muted" />
          </div>
          
          {user.displayName && (
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={user.displayName} disabled className="bg-muted" />
            </div>
          )}

          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={user.uid} disabled className="bg-muted font-mono text-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button variant="outline" onClick={() => fetchSettings()} className="w-full sm:w-auto">
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
