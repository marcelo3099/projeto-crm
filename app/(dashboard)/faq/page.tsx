'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface Article {
    id: number;
    title: string;
    content: string;
    category: string;
    slug: string;
}

export default function FAQPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/knowledge')
            .then(res => res.json())
            .then(data => {
                setArticles(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredArticles = articles.filter(art =>
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        art.content.toLowerCase().includes(search.toLowerCase()) ||
        art.category.toLowerCase().includes(search.toLowerCase())
    );

    const categories = Array.from(new Set(articles.map(a => a.category)));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 pt-20 pb-24 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                    Como podemos ajudar?
                </h1>
                <div className="max-w-2xl mx-auto relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Busque por dúvidas, recursos ou guias..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-2xl focus:ring-4 focus:ring-blue-500/30 outline-none transition-all text-lg"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 -mt-12 pb-20">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar Categories */}
                        <div className="md:col-span-1 space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Categorias</h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
                                    >
                                        <span className="capitalize font-medium text-gray-700 group-hover:text-blue-600">{cat}</span>
                                        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </div>

                            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                <MessageCircle className="mb-4" size={32} />
                                <h3 className="text-lg font-bold mb-2">Suporte Direto</h3>
                                <p className="text-blue-100 text-sm mb-4">Não encontrou o que precisava? Nossa equipe está pronta para ajudar.</p>
                                <button className="w-full bg-white text-blue-600 font-bold py-2 rounded-xl hover:bg-blue-50 transition-colors">
                                    Falar com Consultor
                                </button>
                            </div>
                        </div>

                        {/* Articles List */}
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Artigos Sugeridos</h2>
                            {filteredArticles.length > 0 ? (
                                filteredArticles.map(art => (
                                    <div key={art.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                                <BookOpen size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded tracking-wider">
                                                        {art.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {art.title}
                                                </h3>
                                                <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                                                    {art.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <HelpCircle className="mx-auto text-gray-300 mb-4" size={64} />
                                    <h3 className="text-lg font-medium text-gray-500">Nenhum artigo encontrado para "{search}"</h3>
                                    <button onClick={() => setSearch('')} className="mt-4 text-blue-600 font-bold hover:underline"> Limpar busca</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
