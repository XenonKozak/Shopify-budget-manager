import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BudgetLimit from '@/models/BudgetLimit';
import TransactionLog from '@/models/TransactionLog';

async function fetchProductImage(productId: string): Promise<string | undefined> {
    const shop = process.env.SHOPIFY_SHOP_NAME;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shop || !accessToken || !productId) return undefined;

    try {
        const response = await fetch(`https://${shop}/admin/api/2024-01/products/${productId}.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.product?.image?.src;
        }
    } catch (error) {
        console.error(`Failed to fetch image for product ${productId}:`, error);
    }
    return undefined;
}

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const order = JSON.parse(rawBody);

        // Verify webhook (Important for production, skipped here for simplicity in initial dev phase)

        const orderId = order.id.toString();
        const orderName = order.name || `#${orderId}`;
        const amount = parseFloat(order.total_price);
        const currency = order.currency;

        // Process line items
        const rawLineItems = order.line_items || [];
        const shop = process.env.SHOPIFY_SHOP_NAME;

        const items = await Promise.all(
            rawLineItems.map(async (item: any) => {
                const productId = item.product_id?.toString();
                const image = productId ? await fetchProductImage(productId) : undefined;
                const productUrl = productId && shop ? `https://${shop}/admin/products/${productId}` : undefined;

                return {
                    name: item.name || item.title || 'Unknown Product',
                    quantity: item.quantity || 1,
                    price: parseFloat(item.price || '0'),
                    productId: productId || 'unknown',
                    image,
                    productUrl,
                };
            })
        );

        // For simplicity in the personal app, we'll assign all purchases to a default "general" category,
        // or the first active budget we find.
        const category = 'general';

        await connectToDatabase();

        // Check if there's an active limit for this category
        let limitRecord = await BudgetLimit.findOne({ category, isActive: true });

        // If 'general' doesn't exist, try to find any active budget
        if (!limitRecord) {
            limitRecord = await BudgetLimit.findOne({ isActive: true });
        }

        if (!limitRecord) {
            // No limit set, still log the transaction as ALLOWED but don't update budgets
            await TransactionLog.create({
                orderId,
                orderName,
                category: 'untracked',
                amount,
                currency,
                status: 'ALLOWED',
                reason: 'No active budget limits configured',
                items,
            });
            return NextResponse.json({ message: 'No limit configured, order allowed' }, { status: 200 });
        }

        const newSpent = limitRecord.currentSpent + amount;

        // Check if the order exceeds the limit
        if (newSpent > limitRecord.monthlyLimit) {
            // ALERT/BLOCK LOGIC
            await TransactionLog.create({
                orderId,
                orderName,
                category: limitRecord.category,
                amount,
                currency,
                status: 'BLOCKED',
                reason: `Limit exceeded. Order of ${amount} ${currency} would result in spend of ${newSpent} (Limit: ${limitRecord.monthlyLimit})`,
                items,
            });

            await cancelShopifyOrder(orderId, 'Przekroczono osobisty limit wydatków.');

            return NextResponse.json({ message: 'Order blocked and cancelled due to personal budget limit' }, { status: 200 });
        } else {
            // ALLOW THE ORDER
            limitRecord.currentSpent = newSpent;
            await limitRecord.save();

            await TransactionLog.create({
                orderId,
                orderName,
                category: limitRecord.category,
                amount,
                currency,
                status: 'ALLOWED',
                items,
            });

            return NextResponse.json({ message: 'Order allowed and budget updated' }, { status: 200 });
        }

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal server error while processing webhook' }, { status: 500 });
    }
}

// Helper function to cancel order in Shopify
async function cancelShopifyOrder(orderId: string, reasonDetails: string) {
    const shop = process.env.SHOPIFY_SHOP_NAME;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shop || !accessToken) {
        console.error('Missing Shopify credentials. Cannot cancel order.');
        return;
    }

    try {
        const response = await fetch(`https://${shop}/admin/api/2024-01/orders/${orderId}/cancel.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({
                email: true, // Send email to customer
                note: reasonDetails // Add note to order
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to cancel order in Shopify:', errorData);
        } else {
            console.log(`Successfully cancelled order ${orderId} in Shopify.`);
        }
    } catch (error) {
        console.error('Network error calling Shopify admin API:', error);
    }
}
