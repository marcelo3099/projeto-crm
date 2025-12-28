'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

interface EditDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    deal: any; // The selected deal object
}

export default function EditDealModal({ isOpen, onClose, onSuccess, deal }: EditDealModalProps) {
    const [title, setTitle] = useState('');
    const [contactId, setContactId] = useState('');
    const [value, setValue] = useState('');
    const [pipelineId, setPipelineId] = useState('');
    const [stageId, setStageId] = useState('');
    const [location, setLocation] = useState('');
    const [propertyType, setPropertyType] = useState('APARTMENT');
    const [dealStatus, setDealStatus] = useState('AVAILABLE');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    interface Contact { id: number; name: string; }
    interface Pipeline { id: number; name: string; stages: { id: number; name: string }[] }

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);

    useEffect(() => {
        if (isOpen && deal) {
            setTitle(deal.deal.title || '');
            setContactId(deal.deal.contactId?.toString() || '');
            setValue(deal.deal.value ? (deal.deal.value / 100).toString() : '0');
            setPipelineId(deal.deal.pipelineId?.toString() || '');
            setStageId(deal.deal.stageId?.toString() || '');
            setLocation(deal.deal.location || '');
            setPropertyType(deal.deal.propertyType || 'APARTMENT');
            setDealStatus(deal.deal.dealStatus || 'AVAILABLE');
            setNotes(deal.deal.notes || '');

            Promise.all([
                fetch('/api/contacts').then(res => res.json()),
                fetch('/api/pipelines').then(res => res.json())
            ]).then(([contactsData, pipelinesData]) => {
                setContacts(contactsData);
                setPipelines(pipelinesData);
            });
        }
    }, [isOpen, deal]);

    if (!isOpen || !deal) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/deals/${deal.deal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    contactId: contactId ? parseInt(contactId) : null,
                    pipelineId: parseInt(pipelineId),
                    stageId: parseInt(stageId),
                    value: value ? parseFloat(value.replace(',', '.')) * 100 : 0,
                    location,
                    propertyType,
                    dealStatus,
                    notes
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                alert('Erro ao atualizar negócio');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar negócio');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este negócio?')) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/deals/${deal.deal.id}`, { method: 'DELETE' });
            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                alert('Erro ao excluir negócio');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir negócio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Editar Negócio</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Imóvel/Anúncio *</label>
                        <input
                            required
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status do Imóvel</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                            value={dealStatus}
                            onChange={e => setDealStatus(e.target.value)}
                        >
                            <option value="AVAILABLE">Disponível</option>
                            <option value="RESERVED">Reservado</option>
                            <option value="SOLD">Vendido / Alugado</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente Interessado</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none bg-blue-50"
                            value={contactId}
                            onChange={e => setContactId(e.target.value)}
                        >
                            <option value="">Ainda sem interessados...</option>
                            {contacts.map(contact => (
                                <option key={contact.id} value={contact.id}>{contact.name}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-blue-600">Vincule um contato quando houver interesse no imóvel.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                value={propertyType}
                                onChange={e => setPropertyType(e.target.value)}
                            >
                                <option value="APARTMENT">Apartamento</option>
                                <option value="HOUSE">Casa</option>
                                <option value="COMERCIAL">Comercial</option>
                                <option value="LAND">Terreno</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex justify-between gap-3">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir Negócio"
                        >
                            <Trash2 size={20} />
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                            >
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
