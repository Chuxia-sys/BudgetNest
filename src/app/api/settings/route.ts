import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { UserSettings } from '@/types';

const DEFAULT_SETTINGS: UserSettings = {
  spendingLimit: 5000,
  notificationsEnabled: true,
  currency: 'USD',
};

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const settingsDoc = await getDoc(doc(db, 'users', uid, 'settings', 'config'));
    
    if (settingsDoc.exists()) {
      return NextResponse.json({ settings: settingsDoc.data() });
    } else {
      return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Update user settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, spendingLimit, notificationsEnabled, currency, profilePicture } = body;

    if (!uid) {
      console.error('Settings POST: Missing uid');
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('Settings POST: Saving for uid:', uid);

    const settingsData: Partial<UserSettings> = {};

    if (spendingLimit !== undefined) {
      settingsData.spendingLimit = parseFloat(spendingLimit);
      console.log('Settings POST: Spending limit:', settingsData.spendingLimit);
    }

    if (notificationsEnabled !== undefined) {
      settingsData.notificationsEnabled = notificationsEnabled;
      console.log('Settings POST: Notifications enabled:', settingsData.notificationsEnabled);
    }

    if (currency) {
      settingsData.currency = currency;
      console.log('Settings POST: Currency:', settingsData.currency);
    }

    if (profilePicture !== undefined) {
      // Validate profile picture is a valid base64 image
      if (typeof profilePicture === 'string' && profilePicture.length > 0) {
        if (!profilePicture.startsWith('data:image/')) {
          console.error('Settings POST: Invalid profile picture format');
          return NextResponse.json(
            { error: 'Invalid profile picture format' },
            { status: 400 }
          );
        }

        // Check size (base64 length)
        const base64Data = profilePicture.split(',')[1];
        if (base64Data && base64Data.length > 1000000) {
          console.error('Settings POST: Profile picture too large');
          return NextResponse.json(
            { error: 'Profile picture too large (max 500KB)' },
            { status: 400 }
          );
        }

        settingsData.profilePicture = profilePicture;
        console.log('Settings POST: Profile picture saved (size:', base64Data?.length, 'characters)');
      } else if (profilePicture === null || profilePicture === '') {
        // Allow removing profile picture
        settingsData.profilePicture = undefined;
        console.log('Settings POST: Profile picture removed');
      }
    }

    console.log('Settings POST: Saving to Firestore...');

    await setDoc(doc(db, 'users', uid, 'settings', 'config'), settingsData, { merge: true });

    console.log('Settings POST: Success');
    return NextResponse.json({ success: true, settings: settingsData });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
