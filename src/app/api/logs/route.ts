import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import TransactionLog from '@/models/TransactionLog';

// GET /api/logs
export async function GET() {
    try {
        await connectToDatabase();
        // Get latest 50 logs
        const logs = await TransactionLog.find({})
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ success: true, data: logs });
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch transaction logs' },
            { status: 500 }
        );
    }
}
