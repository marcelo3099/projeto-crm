'use client';

import { useState } from 'react';
import { Phone, Mail, Instagram, Globe, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Lead = {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    source: string;
    status: string;
    notes: string | null;
    createdAt: string;
};

const STATUS_COLUMNS = [
    { id: 'NOVO', label: 'Novo', color: 'bg-blue-100 border-blue-200' },
    { id: 'FRIO', label: 'Frio', color: 'bg-gray-100 border-gray-200' },
    { id: 'MEDIO', label: 'Médio', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'QUENTE', label: 'Quente', color: 'bg-orange-100 border-orange-200' },
    { id: 'FECHADO', label: 'Fechado', color: 'bg-green-100 border-green-200' },
];

export default function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
    // We manage leads state here to allow optimistic updates or re-fetching
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const router = useRouter();

    // Function to move lead status (simplified, in future use real DnD)
    const moveLead = async (leadId: number, currentStatus: string, direction: 'forward' | 'backward') => {
        const currentIndex = STATUS_COLUMNS.findIndex(c => c.id === currentStatus);
        if (currentIndex === -1) return;

        const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < 0 || newIndex >= STATUS_COLUMNS.length) return;

        const newStatus = STATUS_COLUMNS[newIndex].id;

        // Optimistic update
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

        try {
            const res = await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                throw new Error('Failed to update status');
            }

            router.refresh(); // Refresh server data so other components know (optional if local state is enough)
        } catch (error) {
            console.error("Failed to update", error);
            // Revert optimistic update
            setLeads(leads.map(l => l.id === leadId ? { ...l, status: currentStatus } : l));
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
            {STATUS_COLUMNS.map((column) => (
                <div key={column.id} className="min-w-[300px] flex flex-col rounded-xl bg-gray-50 border border-gray-200">
                    <div className={`p-3 rounded-t-xl font-bold border-b-2 flex justify-between items-center ${column.color}`}>
                        <span>{column.label}</span>
                        <span className="text-xs bg-white/50 px-2 py-1 rounded-full">
                            {leads.filter(l => l.status === column.id).length}
                        </span>
                    </div>
                    <div className="p-2 flex-1 overflow-y-auto space-y-3">
                        {leads.filter(l => l.status === column.id).map((lead) => (
                            <div key={lead.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-800">{lead.name}</h3>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        {lead.source === 'INSTAGRAM' ? <Instagram size={12} /> : lead.source === 'LANDING_PAGE' ? <Globe size={12} /> : <User size={12} />}
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} />
                                        <span>{lead.phone}</span>
                                    </div>
                                    {lead.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} />
                                            <span className="truncate">{lead.email}</span>
                                        </div>
                                    )}
                                </div>

                                {lead.notes && (
                                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                        {lead.notes}
                                    </div>
                                )}

                                <div className="mt-3 flex justify-between pt-2 border-t border-gray-50">
                                    <button
                                        onClick={() => moveLead(lead.id, lead.status, 'backward')}
                                        disabled={column.id === 'NOVO'}
                                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-20"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => moveLead(lead.id, lead.status, 'forward')}
                                        disabled={column.id === 'FECHADO'}
                                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-20"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
