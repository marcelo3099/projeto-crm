'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Send, HelpCircle, Check, X } from 'lucide-react';

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

function FormContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const dealId = searchParams.get('dealId');

    const [formData, setFormData] = useState<FormData | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedArticle, setSelectedArticle] = useState<any>(null);

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

    const handleHelpClick = async (articleId: number) => {
        try {
            const res = await fetch('/api/knowledge');
            const articles = await res.json();
            const article = articles.find((a: any) => a.id === articleId);
            setSelectedArticle(article);
        } catch (error) {
            console.error('Error fetching article:', error);
        }
    };

    const getCurrentStepFields = () => {
        if (!formData) return [];
        if (formData.steps.length === 0) return formData.fields;
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
                body: JSON.stringify({
                    data: formValues,
                    dealId: dealId
                }),
            });
            if (res.ok) setSubmitted(true);
            else alert('Erro ao enviar formulário.');
        } catch (err) {
            alert('Erro ao enviar formulário.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!formData) return <div className="min-h-screen flex items-center justify-center text-center"><div><h1 className="text-2xl font-bold mb-2">Formulário não encontrado</h1><p className="text-gray-600">Verifique o link e tente novamente.</p></div></div>;
    if (submitted) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-green-600" /></div><h1 className="text-2xl font-bold mb-2">Enviado com sucesso!</h1><p className="text-gray-600">Em breve entraremos em contato.</p></div></div>;

    const totalSteps = formData.steps.length || 1;
    const stepFields = getCurrentStepFields();
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{formData.form.name}</h1>

                    {formData.steps.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2 text-sm">
                                <span className="font-medium text-gray-600">Passo {currentStep + 1} de {totalSteps}</span>
                                <span className="text-gray-400">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 mb-8">
                        {stepFields.map(field => (
                            <div key={field.id}>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.helpArticleId && (
                                        <button onClick={() => handleHelpClick(field.helpArticleId!)} className="text-blue-500 hover:text-blue-700 transition-colors">
                                            <HelpCircle size={16} />
                                        </button>
                                    )}
                                </div>
                                {field.fieldType === 'textarea' ? (
                                    <textarea className={`w-full rounded-xl border ${errors[field.fieldKey] ? 'border-red-500' : 'border-gray-200'} px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all`} rows={4} value={formValues[field.fieldKey] || ''} onChange={e => setFormValues({ ...formValues, [field.fieldKey]: e.target.value })} />
                                ) : field.fieldType === 'select' ? (
                                    <select className={`w-full rounded-xl border ${errors[field.fieldKey] ? 'border-red-500' : 'border-gray-200'} px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all`} value={formValues[field.fieldKey] || ''} onChange={e => setFormValues({ ...formValues, [field.fieldKey]: e.target.value })}>
                                        <option value="">Selecione...</option>
                                        {field.options && JSON.parse(field.options).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input type={field.fieldType} className={`w-full rounded-xl border ${errors[field.fieldKey] ? 'border-red-500' : 'border-gray-200'} px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all`} value={formValues[field.fieldKey] || ''} onChange={e => setFormValues({ ...formValues, [field.fieldKey]: e.target.value })} />
                                )}
                                {errors[field.fieldKey] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[field.fieldKey]}</p>}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <button onClick={handlePrevious} disabled={currentStep === 0} className="flex items-center gap-2 px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30">
                            <ChevronLeft size={20} /> Anterior
                        </button>
                        {isLastStep ? (
                            <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50">
                                {submitting ? 'Enviando...' : 'Enviar'} <Send size={20} />
                            </button>
                        ) : (
                            <button onClick={handleNext} className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                                Próximo <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {selectedArticle && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative shadow-2xl">
                        <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-lg mb-4 tracking-widest">{selectedArticle.category}</span>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h3>
                        <div className="text-gray-600 leading-relaxed">{selectedArticle.content}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PublicFormPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <FormContent />
        </Suspense>
    );
}
