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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Contatos</h1>
                    <p className="text-gray-600 mt-1">Gerencie todos os seus contatos em um só lugar</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={20} />
                    Novo Contato
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left p-4 font-semibold text-gray-700">Nome</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Telefone</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Empresa</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Origem</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Users size={20} className="text-blue-600" />
                                            </div>
                                            <span className="font-medium text-gray-900">{contact.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {contact.email ? (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail size={16} />
                                                {contact.email}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {contact.phone ? (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone size={16} />
                                                {contact.phone}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {contact.company ? (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Building2 size={16} />
                                                {contact.company}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${contact.source === 'INSTAGRAM' ? 'bg-pink-100 text-pink-700' :
                                            contact.source === 'LANDING_PAGE' ? 'bg-green-100 text-green-700' :
                                                contact.source === 'FORM' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {contact.source}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">
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
