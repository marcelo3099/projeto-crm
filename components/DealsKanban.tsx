'use client';

import { useEffect, useState } from 'react';
import { DollarSign, User, MapPin, Home, Building2, LandPlot, PlusCircle } from 'lucide-react';
import EditDealModal from './EditDealModal';

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
        location?: string;
        propertyType?: string;
        dealStatus?: string;
    };
    contact: Contact | null;
    stage: Stage | null;
}

export default function DealsKanban() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedDealId, setDraggedDealId] = useState<number | null>(null);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
                                        onClick={() => {
                                            setSelectedDeal(deal);
                                            setIsEditModalOpen(true);
                                        }}
                                        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition cursor-grab active:cursor-grabbing ${draggedDealId === deal.deal.id ? 'opacity-50 border-blue-300 border-dashed' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1">{deal.deal.title}</h4>
                                            {deal.deal.dealStatus && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ml-2 ${deal.deal.dealStatus === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                                    deal.deal.dealStatus === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {deal.deal.dealStatus === 'AVAILABLE' ? 'Disp.' : deal.deal.dealStatus === 'RESERVED' ? 'Resv.' : 'Vendido'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            {deal.deal.location && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <MapPin size={12} />
                                                    <span className="truncate">{deal.deal.location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                {deal.deal.propertyType === 'APARTMENT' ? <Home size={12} /> :
                                                    deal.deal.propertyType === 'HOUSE' ? <Home size={12} /> :
                                                        deal.deal.propertyType === 'COMERCIAL' ? <Building2 size={12} /> :
                                                            <LandPlot size={12} />}
                                                <span>{deal.deal.propertyType === 'APARTMENT' ? 'Apartamento' :
                                                    deal.deal.propertyType === 'HOUSE' ? 'Casa' :
                                                        deal.deal.propertyType === 'COMERCIAL' ? 'Comercial' : 'Terreno'}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                                            {deal.contact ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                        <User size={12} />
                                                    </div>
                                                    <span className="truncate">{deal.contact.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                                                    <PlusCircle size={14} />
                                                    <span>Aguardando interessado</span>
                                                </div>
                                            )}

                                            {deal.deal.value > 0 && (
                                                <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                                                    <DollarSign size={14} />
                                                    <span>R$ {(deal.deal.value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                        </div>
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

            <EditDealModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedDeal(null);
                }}
                onSuccess={fetchDeals}
                deal={selectedDeal}
            />
        </div>
    );
}
