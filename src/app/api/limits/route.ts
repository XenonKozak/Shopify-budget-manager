import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BudgetLimit from '@/models/BudgetLimit';

// GET /api/limits
export async function GET() {
    try {
        await connectToDatabase();
        const limits = await BudgetLimit.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: limits });
    } catch (error) {
        console.error('Failed to fetch limits:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch limits' },
            { status: 500 }
        );
    }
}

// POST /api/limits
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, category, monthlyLimit, currency } = body;

        if (!name || !category || monthlyLimit === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Upsert limit for category
        const limit = await BudgetLimit.findOneAndUpdate(
            { category },
            {
                name,
                category,
                monthlyLimit,
                currency: currency || 'PLN',
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, data: limit }, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create/update limit: FULL ERROR DETAILS:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create/update limit: ' + (error.message || String(error)) },
            { status: 500 }
        );
    }
}
