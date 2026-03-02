import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BudgetLimit from '@/models/BudgetLimit';

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    console.log('DELETE route hit');
    try {
        const { id } = await context.params;
        console.log('ID extracted:', id);

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing ID' },
                { status: 400 }
            );
        }

        console.log('Connecting to database...');
        await connectToDatabase();
        console.log('Connected to database.');

        const deletedLimit = await BudgetLimit.findByIdAndDelete(id);

        if (!deletedLimit) {
            return NextResponse.json(
                { success: false, error: 'Limit not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Failed to delete limit:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete limit' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const { name, category, monthlyLimit, currency } = body;

        if (!id || !name || !category || monthlyLimit === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Ensure category uniqueness if category changed
        const existingLimit = await BudgetLimit.findOne({ category, _id: { $ne: id } });
        if (existingLimit) {
            return NextResponse.json(
                { success: false, error: 'Category must be unique' },
                { status: 400 }
            );
        }

        const updatedLimit = await BudgetLimit.findByIdAndUpdate(
            id,
            {
                name,
                category,
                monthlyLimit,
                currency: currency || 'PLN',
            },
            { new: true, runValidators: true }
        );

        if (!updatedLimit) {
            return NextResponse.json(
                { success: false, error: 'Limit not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedLimit });
    } catch (error) {
        console.error('Failed to update limit:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update limit' },
            { status: 500 }
        );
    }
}
