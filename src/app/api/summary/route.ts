import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BudgetLimit from '@/models/BudgetLimit';
import TransactionLog from '@/models/TransactionLog';

export async function GET() {
    try {
        await connectToDatabase();

        // 1 & 4. Get all active budgets to calculate total spent and remaining budget
        const activeBudgets = await BudgetLimit.find({ isActive: true });

        const totalSpent = activeBudgets.reduce((sum, budget) => sum + (budget.currentSpent || 0), 0);
        const totalLimit = activeBudgets.reduce((sum, budget) => sum + (budget.monthlyLimit || 0), 0);
        const remainingBudget = Math.max(0, totalLimit - totalSpent);
        const budgetCategoriesCount = activeBudgets.length;

        // 3. Get blocked purchases count for the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const blockedPurchasesCount = await TransactionLog.countDocuments({
            status: 'BLOCKED',
            createdAt: { $gte: startOfMonth }
        });

        return NextResponse.json({
            success: true,
            data: {
                totalSpent,
                remainingBudget,
                budgetCategoriesCount,
                blockedPurchasesCount,
                // Using PLN as default currency for summary
                currency: 'PLN'
            }
        });

    } catch (error) {
        console.error('Summary fetch error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch summary statistics' }, { status: 500 });
    }
}
