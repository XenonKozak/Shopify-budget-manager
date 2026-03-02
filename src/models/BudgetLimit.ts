import mongoose, { Document, Schema } from 'mongoose';

export interface IBudgetLimit extends Document {
    name: string; // e.g. "Electronics", "Groceries", "Total Monthly Budget"
    category: string; // e.g. "electronics", "groceries", "general"
    monthlyLimit: number;
    currentSpent: number;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BudgetLimitSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        monthlyLimit: {
            type: Number,
            required: true,
            default: 0,
        },
        currentSpent: {
            type: Number,
            required: true,
            default: 0,
        },
        currency: {
            type: String,
            required: true,
            default: 'PLN',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Automatically creates createdAt and updatedAt fields
    }
);

// Mongoose over-writes the model if it already exists when using HMR in Next.js
export default mongoose.models.BudgetLimit ||
    mongoose.model<IBudgetLimit>('BudgetLimit', BudgetLimitSchema);
