'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText, Link as LinkIcon, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Form {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
}

export default function FormsPage() {
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/forms')
            .then(res => res.json())
            .then(data => {
                // Defensive check: ensure data is an array before setting state
                if (Array.isArray(data)) {
                    setForms(data);
                } else {
                    console.error('Forms API returned non-array data:', data);
                    setForms([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch forms:', err);
                setForms([]);
                setLoading(false);
            });
    }, []);

    const copyFormLink = (slug: string) => {
        const url = `${window.location.origin}/f/${slug}`;
        navigator.clipboard.writeText(url);
        alert('Link copiado!');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Formulários</h1>
                    <p className="text-gray-600 mt-1">Crie e gerencie seus formulários de captação</p>
                </div>
                <Link
                    href="/forms/new"
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Novo Formulário
                </Link>
            </div>

            {forms.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum formulário criado</h3>
                    <p className="text-gray-600 mb-4">Crie seu primeiro formulário para começar a captar leads</p>
                    <Link
                        href="/forms/new"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Criar Formulário
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {forms.map((form) => (
                        <div
                            key={form.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition flex flex-col justify-between"
                        >
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">{form.name}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${form.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {form.isActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-mono truncate">/f/{form.slug}</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <p className="text-[10px] text-gray-400">
                                    {new Date(form.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => copyFormLink(form.slug)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Copiar Link"
                                    >
                                        <LinkIcon size={18} />
                                    </button>
                                    <Link
                                        href={`/forms/${form.id}`}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Editar"
                                    >
                                        <Settings size={18} />
                                    </Link>
                                    <button
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Deletar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
