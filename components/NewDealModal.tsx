'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface NewDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewDealModal({ isOpen, onClose, onSuccess }: NewDealModalProps) {
    const [title, setTitle] = useState('');
    const [contactId, setContactId] = useState('');
    const [value, setValue] = useState('');
    const [pipelineId, setPipelineId] = useState('');
    const [stageId, setStageId] = useState('');
    const [location, setLocation] = useState('');
    const [propertyType, setPropertyType] = useState('APARTMENT');
    const [notes, setNotes] = useState('');

    interface Contact { id: number; name: string; }
    interface Pipeline { id: number; name: string; stages: { id: number; name: string }[] }

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                fetch('/api/contacts').then(res => res.json()),
                fetch('/api/pipelines').then(res => res.json())
            ]).then(([contactsData, pipelinesData]) => {
                setContacts(contactsData);
                setPipelines(pipelinesData);
                if (pipelinesData.length > 0) {
                    setPipelineId(pipelinesData[0].id.toString());
                    if (pipelinesData[0].stages.length > 0) {
                        setStageId(pipelinesData[0].stages[0].id.toString());
                    }
                }
            });
        }
    }, [isOpen]);

    // Update stages when pipeline changes
    useEffect(() => {
        if (pipelineId) {
            const pipeline = pipelines.find(p => p.id.toString() === pipelineId);
            if (pipeline && pipeline.stages.length > 0) {
                setStageId(pipeline.stages[0].id.toString());
            }
        }
    }, [pipelineId, pipelines]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/deals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    contactId: contactId ? parseInt(contactId) : null,
                    pipelineId: parseInt(pipelineId),
                    stageId: parseInt(stageId),
                    value: value ? parseFloat(value.replace(',', '.')) * 100 : 0, // Convert to cents
                    location,
                    propertyType,
                    notes
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
                setTitle('');
                setValue('');
                setNotes('');
            } else {
                alert('Erro ao criar negócio');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao criar negócio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Novo Negócio</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Negócio *</label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: Compra Apartamento Jardins"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (Opcional)</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                            value={contactId}
                            onChange={e => setContactId(e.target.value)}
                        >
                            <option value="">Aguardando interessado...</option>
                            {contacts.map(contact => (
                                <option key={contact.id} value={contact.id}>{contact.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                            <input
                                type="text"
                                placeholder="Ex: Jardins, SP"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Imóvel</label>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                            <input
                                type="text"
                                placeholder="0,00"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Funil</label>
                            <select
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                value={pipelineId}
                                onChange={e => setPipelineId(e.target.value)}
                            >
                                {pipelines.map(pipeline => (
                                    <option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>
                                ))}
                            </select>
                        </div>
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

                    <div className="pt-4 flex justify-end gap-3">
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Negócio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
