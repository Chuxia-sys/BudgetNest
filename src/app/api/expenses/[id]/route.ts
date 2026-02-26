import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';

// DELETE - Remove an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'users', uid, 'expenses', params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}

// PUT - Update an expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');
    const body = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount);
    if (body.category) updateData.category = body.category;
    if (body.date) updateData.date = body.date;
    if (body.note !== undefined) updateData.note = body.note;

    await updateDoc(doc(db, 'users', uid, 'expenses', params.id), updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}
