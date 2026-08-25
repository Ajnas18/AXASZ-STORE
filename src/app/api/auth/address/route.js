import { NextResponse } from 'next/server';
import { client } from '@/sanity/client';
import { getSession } from '@/lib/auth';

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { street, city, state, postalCode, country } = body;

    const sanitizedStreet = sanitizeString(street);
    const sanitizedCity = sanitizeString(city);
    const sanitizedState = sanitizeString(state);
    const sanitizedPostalCode = sanitizeString(postalCode);
    const sanitizedCountry = sanitizeString(country || 'India');

    if (!sanitizedStreet || !sanitizedCity || !sanitizedState || !sanitizedPostalCode) {
      return NextResponse.json(
        { error: 'Street, city, state, and postal code are required' },
        { status: 400 }
      );
    }

    const updatedAddress = {
      street: sanitizedStreet,
      city: sanitizedCity,
      state: sanitizedState,
      postalCode: sanitizedPostalCode,
      country: sanitizedCountry,
    };

    await client
      .patch(session.customerId)
      .set({ address: updatedAddress })
      .commit();

    return NextResponse.json({
      success: true,
      message: 'Address saved successfully',
      address: updatedAddress,
    });
  } catch (error) {
    console.error('Update Address Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await client
      .patch(session.customerId)
      .unset(['address'])
      .commit();

    return NextResponse.json({
      success: true,
      message: 'Address removed successfully',
    });
  } catch (error) {
    console.error('Delete Address Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete address' }, { status: 500 });
  }
}
