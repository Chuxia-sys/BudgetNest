import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { SavingsGoal } from '@/types';

// GET - Fetch all goals for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const q = query(collection(db, 'users', uid, 'goals'));
    const querySnapshot = await getDocs(q);
    const goals: SavingsGoal[] = [];
    
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() } as SavingsGoal);
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST - Add a new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, title, targetAmount, deadline } = body;

    if (!uid || !title || !targetAmount || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const goalData = {
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, 'users', uid, 'goals'), goalData);

    return NextResponse.json(
      { id: docRef.id, ...goalData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding goal:', error);
    return NextResponse.json(
      { error: 'Failed to add goal' },
      { status: 500 }
    );
  }
}

// PUT - Update a goal
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');
    const body = await request.json();
    const { goalId, currentAmount } = body;

    if (!uid || !goalId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await updateDoc(doc(db, 'users', uid, 'goals', goalId), {
      currentAmount: parseFloat(currentAmount),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a goal
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');
    const goalId = searchParams.get('goalId');

    if (!uid || !goalId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'users', uid, 'goals', goalId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
