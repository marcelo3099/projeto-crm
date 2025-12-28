'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Mail, Phone, Building2 } from 'lucide-react';
import NewContactModal from '@/components/NewContactModal';

interface Contact {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    source: string;
    createdAt: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/contacts')
            .then(res => res.json())
            .then(data => {
                // Ensure data is always an array to prevent map errors
                if (Array.isArray(data)) {
                    setContacts(data);
                } else {
                    console.error('API returned non-array data:', data);
                    setContacts([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch contacts:', err);
                setContacts([]);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contatos</h1>
                    <p className="text-gray-600 mt-1">Gerencie seus contatos</p>
                </div>
                <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <Plus size={20} />
                    Novo Contato
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                    {contacts.map((contact) => (
                        <div key={contact.id} className="p-4 active:bg-gray-50 transition">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Users size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                                        <p className="text-xs text-gray-500">{new Date(contact.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${contact.source === 'INSTAGRAM' ? 'bg-pink-100 text-pink-700' :
                                    contact.source === 'LANDING_PAGE' ? 'bg-green-100 text-green-700' :
                                        contact.source === 'FORM' ? 'bg-purple-100 text-purple-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {contact.source}
                                </span>
                            </div>
                            <div className="space-y-2 mt-3 text-gray-600">
                                {contact.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail size={14} />
                                        {contact.email}
                                    </div>
                                )}
                                {contact.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone size={14} />
                                        {contact.phone}
                                    </div>
                                )}
                                {contact.company && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 size={14} />
                                        {contact.company}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left p-4 font-semibold text-gray-700">Nome</th>
                                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Email</th>
                                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Telefone</th>
                                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Empresa</th>
                                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Origem</th>
                                <th className="text-left p-4 font-semibold text-gray-700 text-sm">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="border-b border-gray-50 hover:bg-gray-50 transition text-sm">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Users size={16} className="text-blue-600" />
                                            </div>
                                            <span className="font-medium text-gray-900">{contact.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {contact.email || '-'}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {contact.phone || '-'}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {contact.company || '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${contact.source === 'INSTAGRAM' ? 'bg-pink-100 text-pink-700' :
                                            contact.source === 'LANDING_PAGE' ? 'bg-green-100 text-green-700' :
                                                contact.source === 'FORM' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {contact.source}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 whitespace-nowrap">
                                        {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
