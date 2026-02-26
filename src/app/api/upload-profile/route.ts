import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uid = formData.get('uid') as string;
    const file = formData.get('file') as File;

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a reference to the file in Firebase Storage
    const fileName = `profile-${uid}-${Date.now()}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `profile-pictures/${fileName}`);

    // Upload the file
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return NextResponse.json({ 
      success: true, 
      url: downloadURL,
      fileName 
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}
