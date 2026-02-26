import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { Expense } from '@/types';

// GET - Fetch all expenses for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let q = query(
      collection(db, 'users', uid, 'expenses'),
      orderBy('date', 'desc')
    );

    if (month && year) {
      q = query(
        collection(db, 'users', uid, 'expenses'),
        where('date', '>=', `${year}-${month}-01`),
        where('date', '<=', `${year}-${month}-31`),
        orderBy('date', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() } as Expense);
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST - Add a new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, amount, category, date, note } = body;

    if (!uid || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const expenseData = {
      amount: parseFloat(amount),
      category,
      date,
      note: note || '',
      createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, 'users', uid, 'expenses'), expenseData);

    return NextResponse.json(
      { id: docRef.id, ...expenseData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding expense:', error);
    return NextResponse.json(
      { error: 'Failed to add expense' },
      { status: 500 }
    );
  }
}
