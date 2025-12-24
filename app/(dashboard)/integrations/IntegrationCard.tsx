'use client';

import { useState } from 'react';
import { Copy, Eye, EyeOff, Check } from 'lucide-react';

interface IntegrationCardProps {
    title: string;
    value: string;
    description: string;
    isSecret?: boolean;
}

export default function IntegrationCard({ title, value, description, isSecret = false }: IntegrationCardProps) {
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(!isSecret);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>

            <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm text-gray-600 truncate">
                    {isVisible ? value : '•'.repeat(value.length)}
                </div>

                {isSecret && (
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title={isVisible ? "Esconder" : "Mostrar"}
                    >
                        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}

                <button
                    onClick={handleCopy}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Copiar"
                >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
            </div>
        </div>
    );
}
