'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Send, HelpCircle, Check } from 'lucide-react';

interface FormField {
    id: number;
    label: string;
    fieldKey: string;
    fieldType: string;
    isRequired: boolean;
    options?: string;
    stepId?: number;
    helpArticleId?: number;
}

interface FormStep {
    id: number;
    title: string;
    description?: string;
    order: number;
}

interface FormData {
    form: {
        id: number;
        name: string;
        slug: string;
    };
    steps: FormStep[];
    fields: FormField[];
}

export default function PublicFormPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [formData, setFormData] = useState<FormData | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch(`/api/public/forms/${slug}`)
            .then(res => res.json())
            .then(data => {
                setFormData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    const getCurrentStepFields = () => {
        if (!formData) return [];

        if (formData.steps.length === 0) {
            return formData.fields;
        }

        const currentStepData = formData.steps[currentStep];
        return formData.fields.filter(f => f.stepId === currentStepData?.id);
    };

    const validateStep = () => {
        const stepFields = getCurrentStepFields();
        const newErrors: Record<string, string> = {};

        stepFields.forEach(field => {
            if (field.isRequired && !formValues[field.fieldKey]) {
                newErrors[field.fieldKey] = 'Este campo é obrigatório';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
            setErrors({});
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
        setErrors({});
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setSubmitting(true);

        try {
            const res = await fetch(`/api/public/forms/${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: formValues }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                alert('Erro ao enviar formulário. Tente novamente.');
            }
        } catch (err) {
            alert('Erro ao enviar formulário.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    if (!formData) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Formulário não encontrado</h1>
                <p className="text-gray-600">Este formulário não existe ou está inativo.</p>
            </div>
        </div>;
    }

    if (submitted) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Formulário Enviado!</h1>
                <p className="text-gray-600">Obrigado pelo seu interesse. Em breve entraremos em contato.</p>
            </div>
        </div>;
    }

    const totalSteps = formData.steps.length || 1;
    const stepFields = getCurrentStepFields();
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.form.name}</h1>

                    {formData.steps.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">
                                    Etapa {currentStep + 1} de {totalSteps}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {Math.round(((currentStep + 1) / totalSteps) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                                />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mt-4">
                                {formData.steps[currentStep]?.title}
                            </h2>
                            {formData.steps[currentStep]?.description && (
                                <p className="text-gray-600 mt-1">{formData.steps[currentStep].description}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        {stepFields.map(field => (
                            <div key={field.id}>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {field.label}
                                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    {field.helpArticleId && (
                                        <button
                                            type="button"
                                            className="text-blue-600 hover:text-blue-700"
                                            title="Saiba Mais"
                                        >
                                            <HelpCircle size={16} />
                                        </button>
                                    )}
                                </div>

                                {field.fieldType === 'textarea' ? (
                                    <textarea
                                        className={`w-full rounded-lg border ${errors[field.fieldKey] ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-blue-500 focus:outline-none`}
                                        value={formValues[field.fieldKey] || ''}
                                        onChange={(e) => setFormValues({ ...formValues, [field.fieldKey]: e.target.value })}
                                        rows={4}
                                    />
                                ) : field.fieldType === 'select' ? (
                                    <select
                                        className={`w-full rounded-lg border ${errors[field.fieldKey] ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-blue-500 focus:outline-none`}
                                        value={formValues[field.fieldKey] || ''}
                                        onChange={(e) => setFormValues({ ...formValues, [field.fieldKey]: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {field.options && JSON.parse(field.options).map((opt: string) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : field.fieldType === 'radio' ? (
                                    <div className="space-y-2">
                                        {field.options && JSON.parse(field.options).map((opt: string) => (
                                            <label key={opt} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={field.fieldKey}
                                                    value={opt}
                                                    checked={formValues[field.fieldKey] === opt}
                                                    onChange={(e) => setFormValues({ ...formValues, [field.fieldKey]: e.target.value })}
                                                    className="text-blue-600"
                                                />
                                                <span className="text-gray-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type={field.fieldType}
                                        className={`w-full rounded-lg border ${errors[field.fieldKey] ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-blue-500 focus:outline-none`}
                                        value={formValues[field.fieldKey] || ''}
                                        onChange={(e) => setFormValues({ ...formValues, [field.fieldKey]: e.target.value })}
                                    />
                                )}

                                {errors[field.fieldKey] && (
                                    <p className="text-red-500 text-sm mt-1">{errors[field.fieldKey]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={20} />
                            Anterior
                        </button>

                        {isLastStep ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {submitting ? 'Enviando...' : 'Enviar'}
                                <Send size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Próximo
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
