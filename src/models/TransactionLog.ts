import mongoose, { Document, Schema } from 'mongoose';

export interface ITransactionLogItem {
    name: string;
    quantity: number;
    price: number;
    productId: string;
    image?: string;
    productUrl?: string;
}

export interface ITransactionLog extends Document {
    orderId: string; // Order ID from Shopify
    orderName: string; // e.g. "#1001"
    category: string; // which budget category it applies to
    amount: number;
    currency: string;
    status: 'ALLOWED' | 'BLOCKED';
    reason?: string; // e.g., "Limit exceeded by 150 PLN"
    items: ITransactionLogItem[]; // Array of purchased items
    createdAt: Date;
    updatedAt: Date;
}

const TransactionLogItemSchema = new Schema<ITransactionLogItem>(
    {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        productId: { type: String, required: true },
        image: { type: String },
        productUrl: { type: String },
    },
    { _id: false } // Prevent Mongoose from creating _id for subdocuments if not needed
);

const TransactionLogSchema: Schema = new Schema(
    {
        orderId: {
            type: String,
            required: true,
        },
        orderName: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            default: 'general',
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'PLN',
        },
        status: {
            type: String,
            enum: ['ALLOWED', 'BLOCKED'],
            required: true,
        },
        reason: {
            type: String,
        },
        items: {
            type: [TransactionLogItemSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.TransactionLog ||
    mongoose.model<ITransactionLog>('TransactionLog', TransactionLogSchema);
