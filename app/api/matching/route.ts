import { NextResponse } from 'next/server';
import { db } from '@/db';
import { deals, contacts, Deal, Contact } from '@/db/schema';
import { eq, and, gte, lte, or, sql } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const contactId = searchParams.get('contactId');
        const dealId = searchParams.get('dealId');

        // --- MATCHING FOR A SPECIFIC CONTACT ---
        if (contactId) {
            const [contact] = await db.select().from(contacts).where(eq(contacts.id, parseInt(contactId))).limit(1);
            if (!contact || !contact.preferences) return NextResponse.json([]);

            const prefs = JSON.parse(contact.preferences);

            // Basic matching logic based on price, area and type
            const matches = await db.select().from(deals).where(
                and(
                    eq(deals.dealStatus, 'AVAILABLE'),
                    prefs.propertyType ? eq(deals.propertyType, prefs.propertyType) : undefined,
                    prefs.maxPrice ? lte(deals.value, prefs.maxPrice) : undefined,
                    prefs.minArea ? gte(deals.area, prefs.minArea) : undefined,
                    prefs.minBedrooms ? gte(deals.bedrooms, prefs.minBedrooms) : undefined
                )
            ).limit(10);

            return NextResponse.json(matches);
        }

        // --- MATCHING FOR A SPECIFIC PROPERTY ---
        if (dealId) {
            const [deal] = await db.select().from(deals).where(eq(deals.id, parseInt(dealId))).limit(1);
            if (!deal) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

            // We fetch all contacts and filter by prefs (simplification for prototype)
            // In a real scenario, this would be a more complex SQL query using JSON functions
            const allContacts = await db.select().from(contacts);

            const matchedContacts = allContacts.filter(c => {
                if (!c.preferences) return false;
                try {
                    const p = JSON.parse(c.preferences);
                    const matchType = !p.propertyType || p.propertyType === deal.propertyType;
                    const matchPrice = !p.maxPrice || deal.value <= p.maxPrice;
                    const matchArea = !p.minArea || (deal.area || 0) >= p.minArea;
                    return matchType && matchPrice && matchArea;
                } catch { return false; }
            });

            return NextResponse.json(matchedContacts.slice(0, 10));
        }

        return NextResponse.json({ error: 'Missing contactId or dealId' }, { status: 400 });
    } catch (error) {
        console.error('Matching error:', error);
        return NextResponse.json({ error: 'Matching engine failure' }, { status: 500 });
    }
}
