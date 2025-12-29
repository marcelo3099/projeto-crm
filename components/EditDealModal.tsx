'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Home, Info, Users, Image as ImageIcon } from 'lucide-react';

interface EditDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    deal: any;
}

export default function EditDealModal({ isOpen, onClose, onSuccess, deal }: EditDealModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'matching'>('info');
    const [title, setTitle] = useState('');
    const [contactId, setContactId] = useState('');
    const [value, setValue] = useState('');
    const [pipelineId, setPipelineId] = useState('');
    const [stageId, setStageId] = useState('');
    const [location, setLocation] = useState('');
    const [propertyType, setPropertyType] = useState('APARTMENT');
    const [dealStatus, setDealStatus] = useState('AVAILABLE');
    const [notes, setNotes] = useState('');

    // Pro Specs
    const [area, setArea] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [suites, setSuites] = useState('');
    const [parkingSpots, setParkingSpots] = useState('');
    const [features, setFeatures] = useState('');
    const [images, setImages] = useState('');

    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [matchedLeads, setMatchedLeads] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && deal) {
            const d = deal.deal;
            setTitle(d.title || '');
            setContactId(d.contactId?.toString() || '');
            setValue(d.value ? (d.value / 100).toString() : '0');
            setPipelineId(d.pipelineId?.toString() || '');
            setStageId(d.stageId?.toString() || '');
            setLocation(d.location || '');
            setPropertyType(d.propertyType || 'APARTMENT');
            setDealStatus(d.dealStatus || 'AVAILABLE');
            setNotes(d.notes || '');

            setArea(d.area?.toString() || '');
            setBedrooms(d.bedrooms?.toString() || '');
            setBathrooms(d.bathrooms?.toString() || '');
            setSuites(d.suites?.toString() || '');
            setParkingSpots(d.parkingSpots?.toString() || '');
            setFeatures(d.features || '');
            setImages(d.images || '');

            Promise.all([
                fetch('/api/contacts').then(res => res.json()),
                fetch('/api/pipelines').then(res => res.json()),
                fetch(`/api/matching?dealId=${d.id}`).then(res => res.json())
            ]).then(([contactsData, pipelinesData, matchingData]) => {
                setContacts(Array.isArray(contactsData) ? contactsData : []);
                setPipelines(Array.isArray(pipelinesData) ? pipelinesData : []);
                setMatchedLeads(Array.isArray(matchingData) ? matchingData : []);
            }).catch(err => console.error('Error loading modal data:', err));
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
                    value: value ? parseFloat(value.toString().replace(',', '.')) * 100 : 0,
                    location,
                    propertyType,
                    dealStatus,
                    notes,
                    area: area ? parseInt(area) : null,
                    bedrooms: bedrooms ? parseInt(bedrooms) : null,
                    bathrooms: bathrooms ? parseInt(bathrooms) : null,
                    suites: suites ? parseInt(suites) : null,
                    parkingSpots: parkingSpots ? parseInt(parkingSpots) : null,
                    features,
                    images
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
            if (res.ok) { onSuccess(); onClose(); }
            else alert('Erro ao excluir negócio');
        } catch (error) { alert('Erro ao excluir negócio'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Configuração do Imóvel</h2>
                        <p className="text-sm text-gray-500">ID: #{deal.deal.id} • {deal.deal.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-900 transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 border-b border-gray-100 gap-8 bg-gray-50/50">
                    {[
                        { id: 'info', label: 'Geral', icon: Info },
                        { id: 'specs', label: 'Ficha Técnica', icon: Home },
                        { id: 'matching', label: 'Match de Leads', icon: Users, badge: matchedLeads.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-4 border-b-2 transition-all font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{tab.badge}</span>
                            )}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col h-[60vh]">
                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                        {activeTab === 'info' && (
                            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título do Anúncio *</label>
                                        <input required type="text" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={title} onChange={e => setTitle(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                                        <select className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={dealStatus} onChange={e => setDealStatus(e.target.value)}>
                                            <option value="AVAILABLE">Disponível</option>
                                            <option value="RESERVED">Reservado</option>
                                            <option value="SOLD">Vendido / Alugado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preço Venda (R$)</label>
                                        <input type="text" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Localização (Bairro / Cidade)</label>
                                        <input type="text" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={location} onChange={e => setLocation(e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cliente Ativo</label>
                                        <select className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={contactId} onChange={e => setContactId(e.target.value)}>
                                            <option value="">Aguardando interessado...</option>
                                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Área Útil (m²)</label>
                                        <input type="number" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={area} onChange={e => setArea(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quartos</label>
                                        <input type="number" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vagas</label>
                                        <input type="number" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={parkingSpots} onChange={e => setParkingSpots(e.target.value)} />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Diferenciais (Piscina, Academia, etc)</label>
                                        <textarea className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" rows={3} value={features} onChange={e => setFeatures(e.target.value)} placeholder="Ex: Piscina, Varanda Gourmet, Elevador..." />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'matching' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-4 border border-blue-100">
                                    <div className="bg-blue-600 text-white p-2 rounded-xl"><Users size={20} /></div>
                                    <div>
                                        <p className="font-bold text-blue-900">{matchedLeads.length} Leads Qualificados</p>
                                        <p className="text-xs text-blue-700">Com base no perfil deste imóvel.</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {matchedLeads.length > 0 ? (
                                        matchedLeads.map(lead => (
                                            <div key={lead.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600">{lead.name[0]}</div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{lead.name}</p>
                                                        <p className="text-xs text-gray-500">{lead.email || lead.phone}</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => { setContactId(lead.id.toString()); setActiveTab('info'); }} className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all">Vincular</button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <Users size={48} className="mx-auto mb-2 opacity-20" />
                                            <p>Nenhum lead com este perfil encontrado.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
                        <button type="button" onClick={handleDelete} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="Excluir"><Trash2 size={20} /></button>
                        <div className="flex gap-4">
                            <button type="button" onClick={onClose} className="px-6 py-3 text-gray-600 font-bold hover:bg-white rounded-2xl transition-all">Cancelar</button>
                            <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50">
                                {loading ? 'Salvando...' : 'Atualizar Dados'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
