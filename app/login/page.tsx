'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react'; // Client side sign in
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Using Server Action in future is better, but signIn client is standard for simple creds
        // Note: in NextAuth v5, verify if client 'signIn' works as expected or if we need server action.
        // We will use standard fetch to NextAuth endpoint via 'signIn' helper.

        // Actually, for Credentials in v5, it's often better to use a server action or call signIn
        // but the client-side 'signIn' from next-auth/react still works for generic flows.
        // However, with "use server" actions becoming standard, let's keep it simple with the client lib for now.

        // Wait, next-auth/react might not be fully installed or configured? 
        // It is part of 'next-auth' package.

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            console.log('SignIn Response:', res);

            if (res?.error) {
                setError(`Erro: ${res.error}`);
            } else if (res?.ok) {
                router.push('/');
                router.refresh();
            } else {
                setError('Login falhou sem erro específico.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro inesperado ao tentar login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Login CRM</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Entrar
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Demo Acesso</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEmail('recruiter@demo.com');
                            setPassword('recruiter123');
                            // Optional: auto-submit or just fill
                            // handleSubmit(new Event('submit') as any); 
                        }}
                        className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition flex justify-center items-center gap-2 font-medium"
                    >
                        Sou um Recrutador
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                        Clique para preencher os dados de acesso demo (Admin)
                    </p>
                </form>
            </div>
        </div>
    );
}
