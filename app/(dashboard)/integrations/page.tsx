import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Copy } from "lucide-react";
import IntegrationCard from "./IntegrationCard"; // We'll create a small client component for the copy logic

export default async function IntegrationsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const API_SECRET_KEY = process.env.API_SECRET_KEY || "Chave não configurada";
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Integrações</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Segurança</h2>
                    <IntegrationCard
                        title="Chave de API (Secret Key)"
                        value={API_SECRET_KEY}
                        description="Use esta chave no cabeçalho 'x-api-secret' de todas as suas requisições."
                        isSecret={true}
                    />
                </section>

                <hr className="border-gray-200" />

                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Webhooks</h2>
                    <div className="grid gap-4">
                        <IntegrationCard
                            title="Instagram (Zapier/Make)"
                            value={`${BASE_URL}/api/webhooks/instagram`}
                            description="Endpoint para receber mensagens diretas do Instagram."
                        />
                        <IntegrationCard
                            title="Landing Page"
                            value={`${BASE_URL}/api/webhooks/landing-page`}
                            description="Endpoint para receber leads de formulários externos."
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
