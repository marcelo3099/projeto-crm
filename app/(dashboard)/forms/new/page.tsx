'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';

interface Pipeline {
    id: number;
    name: string;
}

interface Field {
    label: string;
    fieldKey: string;
    fieldType: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'number';
    isRequired: boolean;
    options: string[];
}

interface Step {
    title: string;
    description: string;
    order: number;
    fields: Field[];
}

export default function NewFormPage() {
    const router = useRouter();
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [pipelineId, setPipelineId] = useState('');
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [steps, setSteps] = useState<Step[]>([
        { title: 'Informações de Contato', description: 'Dados básicos do lead', order: 0, fields: [] },
        { title: 'Qualificação do Negócio', description: 'Informações sobre o interesse', order: 1, fields: [] },
    ]);

    useEffect(() => {
        fetch('/api/pipelines')
            .then(res => res.json())
            .then(data => {
                setPipelines(data);
                if (data.length > 0) setPipelineId(data[0].id.toString());
            });
    }, []);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (name: string) => {
        setFormName(name);
        if (!formSlug) {
            setFormSlug(generateSlug(name));
        }
    };

    const addField = (stepIndex: number) => {
        const newSteps = [...steps];
        newSteps[stepIndex].fields.push({
            label: '',
            fieldKey: '',
            fieldType: 'text',
            isRequired: false,
            options: [],
        });
        setSteps(newSteps);
    };

    const updateField = (stepIndex: number, fieldIndex: number, updates: Partial<Field>) => {
        const newSteps = [...steps];
        newSteps[stepIndex].fields[fieldIndex] = { ...newSteps[stepIndex].fields[fieldIndex], ...updates };
        setSteps(newSteps);
    };

    const removeField = (stepIndex: number, fieldIndex: number) => {
        const newSteps = [...steps];
        newSteps[stepIndex].fields.splice(fieldIndex, 1);
        setSteps(newSteps);
    };

    const handleSave = async () => {
        if (!formName || !formSlug || !pipelineId) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            // 1. Create form
            const formRes = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName,
                    slug: formSlug,
                    pipelineId: parseInt(pipelineId),
                    isActive: true,
                }),
            });

            if (!formRes.ok) throw new Error('Erro ao criar formulário');
            const form = await formRes.json();

            // 2. Create steps and fields
            for (const step of steps) {
                const stepRes = await fetch(`/api/forms/${form.id}/steps`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(step),
                });

                if (!stepRes.ok) continue;
                const createdStep = await stepRes.json();

                // Create fields for this step
                for (const field of step.fields) {
                    await fetch(`/api/forms/${form.id}/fields`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...field,
                            stepId: createdStep.id,
                            fieldKey: field.fieldKey || field.label.toLowerCase().replace(/\s+/g, '_'),
                        }),
                    });
                }
            }

            router.push('/forms');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar formulário');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Novo Formulário</h1>
                    <p className="text-gray-600 mt-1">Configure seu formulário de captação de leads</p>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <Save size={20} />
                    Salvar
                </button>
            </div>

            <div className="space-y-6">
                {/* Form Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações Básicas</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome do Formulário <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                value={formName}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Ex: Qualificação de Lead Imobiliário"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug (URL) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">/f/</span>
                                <input
                                    type="text"
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none font-mono text-sm"
                                    value={formSlug}
                                    onChange={(e) => setFormSlug(e.target.value)}
                                    placeholder="qualificacao-lead"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pipeline de Destino <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                value={pipelineId}
                                onChange={(e) => setPipelineId(e.target.value)}
                            >
                                {pipelines.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                {steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Etapa {stepIndex + 1}: {step.title}
                                </h2>
                                <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                            <button
                                onClick={() => addField(stepIndex)}
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                            >
                                <Plus size={16} />
                                Adicionar Campo
                            </button>
                        </div>

                        <div className="space-y-3">
                            {step.fields.map((field, fieldIndex: number) => (
                                <div key={fieldIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Label do campo"
                                            className="rounded border border-gray-300 px-3 py-2 text-sm"
                                            value={field.label}
                                            onChange={(e) => updateField(stepIndex, fieldIndex, { label: e.target.value })}
                                        />
                                        <select
                                            className="rounded border border-gray-300 px-3 py-2 text-sm"
                                            value={field.fieldType}
                                            onChange={(e) => updateField(stepIndex, fieldIndex, { fieldType: e.target.value as Field['fieldType'] })}
                                        >
                                            <option value="text">Texto</option>
                                            <option value="email">E-mail</option>
                                            <option value="phone">Telefone</option>
                                            <option value="textarea">Área de Texto</option>
                                            <option value="select">Seleção</option>
                                            <option value="radio">Múltipla Escolha</option>
                                        </select>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={field.isRequired}
                                                onChange={(e) => updateField(stepIndex, fieldIndex, { isRequired: e.target.checked })}
                                                className="rounded text-blue-600"
                                            />
                                            Obrigatório
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => removeField(stepIndex, fieldIndex)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
