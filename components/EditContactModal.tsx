'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Heart, Info, Home } from 'lucide-react';

interface EditContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contact: any;
}

export default function EditContactModal({ isOpen, onClose, onSuccess, contact }: EditContactModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'preferences' | 'matching'>('info');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [preferences, setPreferences] = useState<any>({});

    const [loading, setLoading] = useState(false);
    const [matchedProperties, setMatchedProperties] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && contact) {
            setName(contact.name || '');
            setEmail(contact.email || '');
            setPhone(contact.phone || '');
            setCompany(contact.company || '');

            let prefs = {};
            try {
                prefs = contact.preferences ? JSON.parse(contact.preferences) : {};
            } catch (e) { console.error('Error parsing prefs', e); }
            setPreferences(prefs);

            // Load matches
            fetch(`/api/matching?contactId=${contact.id}`)
                .then(res => res.json())
                .then(data => setMatchedProperties(Array.isArray(data) ? data : []))
                .catch(err => console.error(err));
        }
    }, [isOpen, contact]);

    if (!isOpen || !contact) return null;

    const updatePref = (key: string, value: any) => {
        setPreferences({ ...preferences, [key]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/contacts/${contact.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, email, phone, company,
                    preferences: JSON.stringify(preferences)
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                alert('Erro ao atualizar contato');
            }
        } catch (error) {
            alert('Erro ao atualizar contato');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Perfil do Lead</h2>
                        <p className="text-sm text-gray-500">Gestão de preferências e matching</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-900 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex px-8 border-b border-gray-100 gap-8 bg-gray-50/50">
                    {[
                        { id: 'info', label: 'Dados Básicos', icon: Info },
                        { id: 'preferences', label: 'Interesses', icon: Heart },
                        { id: 'matching', label: 'Imóveis Sugeridos', icon: Home, badge: matchedProperties.length }
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
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        {activeTab === 'info' && (
                            <div className="space-y-4 animate-in slide-in-from-left-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                                        <input required type="text" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500" value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                                        <input type="email" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp / Telefone</label>
                                        <input type="text" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500" value={phone} onChange={e => setPhone(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Imóvel</label>
                                        <select className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={preferences.propertyType || ''} onChange={e => updatePref('propertyType', e.target.value)}>
                                            <option value="">Indiferente</option>
                                            <option value="APARTMENT">Apartamento</option>
                                            <option value="HOUSE">Casa</option>
                                            <option value="COMERCIAL">Comercial</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Máximo (R$)</label>
                                        <input type="number" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={preferences.maxPrice || ''} onChange={e => updatePref('maxPrice', parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Mín. Quartos</label>
                                        <input type="number" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={preferences.minBedrooms || ''} onChange={e => updatePref('minBedrooms', parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Mín. Área (m²)</label>
                                        <input type="number" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={preferences.minArea || ''} onChange={e => updatePref('minArea', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'matching' && (
                            <div className="space-y-4 animate-in fade-in">
                                {matchedProperties.length > 0 ? (
                                    matchedProperties.map(prop => (
                                        <div key={prop.id} className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 transition-colors flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Home size={24} className="text-gray-400" /></div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{prop.title}</p>
                                                    <p className="text-xs text-gray-500">{prop.location} • R$ {(prop.value / 100).toLocaleString('pt-BR')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                                <span>{prop.area}m²</span>
                                                <span>{prop.bedrooms} Q</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <Home size={48} className="mx-auto mb-2 opacity-20" />
                                        <p>Defina as preferências para ver imóveis compatíveis.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 mt-auto">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-gray-600 font-bold hover:bg-white rounded-2xl transition-all">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50">
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
