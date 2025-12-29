'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Mail, Phone, Building2, Search } from 'lucide-react';
import NewContactModal from '@/components/NewContactModal';
import EditContactModal from '@/components/EditContactModal';

interface Contact {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    source: string;
    createdAt: string;
    preferences?: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const fetchContacts = () => {
        setLoading(true);
        fetch('/api/contacts')
            .then(res => res.json())
            .then(data => {
                setContacts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                setContacts([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && contacts.length === 0) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lead Intelligence</h1>
                    <p className="text-gray-500 mt-1">Gerencie leads e cruzamentos de interesses.</p>
                </div>
                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 font-bold"
                >
                    <Plus size={20} />
                    Novo Lead
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar lead por nome ou email..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-50">
                    {filteredContacts.map((contact) => (
                        <div key={contact.id} onClick={() => setSelectedContact(contact)} className="p-5 active:bg-gray-50 transition cursor-pointer">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                        <Users size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{contact.name}</h3>
                                        <p className="text-xs text-gray-400 tracking-wider font-semibold">{new Date(contact.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-gray-100 text-gray-500 border border-gray-200">
                                    {contact.source}
                                </span>
                            </div>
                            <div className="space-y-2 text-gray-600 text-sm">
                                {contact.email && <div className="flex items-center gap-2"><Mail size={14} /> {contact.email}</div>}
                                {contact.phone && <div className="flex items-center gap-2"><Phone size={14} /> {contact.phone}</div>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="text-left p-6 font-bold text-gray-400 text-xs uppercase tracking-widest">Lead</th>
                                <th className="text-left p-6 font-bold text-gray-400 text-xs uppercase tracking-widest">Contato</th>
                                <th className="text-left p-6 font-bold text-gray-400 text-xs uppercase tracking-widest">Origem</th>
                                <th className="text-left p-6 font-bold text-gray-400 text-xs uppercase tracking-widest">Preferência</th>
                                <th className="text-left p-6 font-bold text-gray-400 text-xs uppercase tracking-widest">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredContacts.map((contact) => (
                                <tr key={contact.id} onClick={() => setSelectedContact(contact)} className="hover:bg-blue-50/30 transition-all cursor-pointer group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {contact.name[0]}
                                            </div>
                                            <span className="font-bold text-gray-900 group-hover:text-blue-700">{contact.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col text-sm text-gray-500 italic">
                                            <span>{contact.email || '-'}</span>
                                            <span>{contact.phone || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black tracking-tighter uppercase text-gray-500">
                                            {contact.source}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        {contact.preferences ? (
                                            <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                <span className="text-xs font-bold uppercase tracking-tight">Smart Profile</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-300 font-medium">Não configurado</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-gray-400 text-xs font-bold">
                                        {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <NewContactModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onSuccess={fetchContacts}
            />

            {selectedContact && (
                <EditContactModal
                    isOpen={!!selectedContact}
                    onClose={() => setSelectedContact(null)}
                    onSuccess={fetchContacts}
                    contact={selectedContact}
                />
            )}
        </div>
    );
}
