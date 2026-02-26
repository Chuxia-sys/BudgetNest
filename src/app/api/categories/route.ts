import { NextRequest, NextResponse } from 'next/server';
import { db, isFirebaseConfigAvailable } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { Category } from '@/types';

// Default categories with colors
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'crypto', name: 'Crypto', color: '#f59e0b', icon: '₿' },
  { id: 'load', name: 'Load', color: '#10b981', icon: '📱' },
  { id: 'allowance', name: 'Allowance', color: '#8b5cf6', icon: '💰' },
  { id: 'food', name: 'Food', color: '#ef4444', icon: '🍔' },
  { id: 'gas', name: 'Gas', color: '#3b82f6', icon: '⛽' },
  { id: 'parcel', name: 'Parcel', color: '#ec4899', icon: '📦' },
];

// GET - Fetch all categories for a user
export async function GET(request: NextRequest) {
  try {
    // Return default categories if Firebase is not configured
    if (!isFirebaseConfigAvailable()) {
      return NextResponse.json({ categories: DEFAULT_CATEGORIES });
    }

    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // First get user's custom categories
    const q = query(collection(db, 'users', uid, 'categories'));
    const querySnapshot = await getDocs(q);
    const categories: Category[] = [...DEFAULT_CATEGORIES];
    
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Add a new custom category
export async function POST(request: NextRequest) {
  try {
    // Return error if Firebase is not configured
    if (!isFirebaseConfigAvailable()) {
      return NextResponse.json(
        { error: 'Firebase not configured. Please add your Firebase credentials.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { uid, name, color, icon } = body;

    if (!uid || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const categoryData = {
      name,
      color: color || '#6b7280',
      icon: icon || '📦',
    };

    const docRef = await addDoc(collection(db, 'users', uid, 'categories'), categoryData);

    return NextResponse.json(
      { id: docRef.id, ...categoryData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json(
      { error: 'Failed to add category' },
      { status: 500 }
    );
  }
}

// PUT - Update a category
export async function PUT(request: NextRequest) {
  try {
    // Return error if Firebase is not configured
    if (!isFirebaseConfigAvailable()) {
      return NextResponse.json(
        { error: 'Firebase not configured. Please add your Firebase credentials.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { uid, categoryId, name, color, icon } = body;

    if (!uid || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if it's a default category (can't edit default categories)
    const isDefaultCategory = DEFAULT_CATEGORIES.some(cat => cat.id === categoryId);
    if (isDefaultCategory) {
      return NextResponse.json(
        { error: 'Cannot edit default categories' },
        { status: 400 }
      );
    }

    const categoryData: any = {};
    if (name) categoryData.name = name;
    if (color) categoryData.color = color;
    if (icon) categoryData.icon = icon;

    const categoryRef = doc(db, 'users', uid, 'categories', categoryId);
    await updateDoc(categoryRef, categoryData);

    return NextResponse.json({ id: categoryId, ...categoryData });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a custom category
export async function DELETE(request: NextRequest) {
  try {
    // Return error if Firebase is not configured
    if (!isFirebaseConfigAvailable()) {
      return NextResponse.json(
        { error: 'Firebase not configured. Please add your Firebase credentials.' },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');
    const categoryId = searchParams.get('categoryId');

    if (!uid || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if it's a default category (can't delete default categories)
    const isDefaultCategory = DEFAULT_CATEGORIES.some(cat => cat.id === categoryId);
    if (isDefaultCategory) {
      return NextResponse.json(
        { error: 'Cannot delete default categories' },
        { status: 400 }
      );
    }

    const categoryRef = doc(db, 'users', uid, 'categories', categoryId);
    await deleteDoc(categoryRef);

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
