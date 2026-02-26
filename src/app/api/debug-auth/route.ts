import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'No UID provided' }, { status: 400 });
    }

    console.log('Debug auth: Checking access for uid:', uid);

    // Try to access the settings document
    const settingsRef = doc(db, 'users', uid, 'settings', 'config');
    const settingsDoc = await getDoc(settingsRef);

    console.log('Debug auth: Settings doc exists:', settingsDoc.exists());

    return NextResponse.json({
      success: true,
      uid,
      settingsExist: settingsDoc.exists(),
      settingsData: settingsDoc.exists() ? settingsDoc.data() : null
    });
  } catch (error: any) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      error: error.message,
      code: error.code,
      fullError: error.toString()
    }, { status: 500 });
  }
}
