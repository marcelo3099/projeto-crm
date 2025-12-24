'use client';

import { useEffect, useState } from 'react';
import { DollarSign, User } from 'lucide-react';

interface Stage {
    id: number;
    name: string;
    color: string;
    order: number;
}

interface Contact {
    id: number;
    name: string;
    email?: string;
}

interface Deal {
    deal: {
        id: number;
        title: string;
        value: number;
        notes?: string;
        stageId: number;
    };
    contact: Contact | null;
    stage: Stage | null;
}

export default function DealsKanban() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedDealId, setDraggedDealId] = useState<number | null>(null);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = () => {
        Promise.all([
            fetch('/api/deals').then(res => res.json()),
            fetch('/api/pipelines').then(res => res.json()),
        ]).then(([dealsData, pipelinesData]) => {
            setDeals(dealsData);
            if (pipelinesData.length > 0) {
                setStages(pipelinesData[0].stages || []);
            }
            setLoading(false);
        });
    };

    const handleDragStart = (e: React.DragEvent, dealId: number) => {
        setDraggedDealId(dealId);
        e.dataTransfer.setData('text/plain', dealId.toString());
        e.dataTransfer.effectAllowed = 'move';
        // Add a ghost image or effect if needed
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetStageId: number) => {
        e.preventDefault();
        const dealId = parseInt(e.dataTransfer.getData('text/plain'));

        if (dealId) {
            // Optimistic update
            const updatedDeals = deals.map(d => {
                if (d.deal.id === dealId) {
                    return { ...d, deal: { ...d.deal, stageId: targetStageId } };
                }
                return d;
            });
            setDeals(updatedDeals);
            setDraggedDealId(null);

            // API Call
            try {
                await fetch(`/api/deals/${dealId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stageId: targetStageId }),
                });
            } catch (error) {
                console.error('Failed to update deal stage', error);
                // Revert or show error (could imply refetching)
                fetchDeals();
            }
        }
    };

    const getDealsByStage = (stageId: number) => {
        return deals.filter(d => d.deal.stageId === stageId);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
            {stages.map((stage) => {
                const stageDeals = getDealsByStage(stage.id);

                return (
                    <div
                        key={stage.id}
                        className="flex-shrink-0 w-80 h-full flex flex-col"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col max-h-full">
                            <div
                                className="p-4 border-b border-gray-100 flex-shrink-0"
                                style={{ borderTopColor: stage.color, borderTopWidth: '3px' }}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 font-medium">
                                            R$ {stageDeals.reduce((acc, d) => acc + (d.deal.value || 0), 0) / 100}
                                        </span>
                                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                                            {stageDeals.length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 space-y-3 overflow-y-auto flex-1 bg-gray-50/50">
                                {stageDeals.map((deal) => (
                                    <div
                                        key={deal.deal.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, deal.deal.id)}
                                        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-grab active:cursor-grabbing ${draggedDealId === deal.deal.id ? 'opacity-50 border-blue-300 border-dashed' : ''
                                            }`}
                                    >
                                        <h4 className="font-medium text-gray-900 mb-2">{deal.deal.title}</h4>

                                        {deal.contact && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <User size={14} />
                                                <span>{deal.contact.name}</span>
                                            </div>
                                        )}

                                        {deal.deal.value > 0 && (
                                            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                                                <DollarSign size={14} />
                                                <span>R$ {(deal.deal.value / 100).toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {stageDeals.length === 0 && (
                                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg m-2">
                                        <div className="text-center text-gray-400 text-sm py-8">
                                            Arraste para cá
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
