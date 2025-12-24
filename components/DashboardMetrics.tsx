'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricsProps {
    deals: any[];
    stages: any[];
}

export default function DashboardMetrics({ deals, stages }: MetricsProps) {
    const [metrics, setMetrics] = useState({
        totalDeals: 0,
        totalValue: 0,
        averageValue: 0,
        conversionRate: 0,
        activeContacts: 0,
    });

    useEffect(() => {
        if (deals.length === 0) return;

        const totalValue = deals.reduce((acc, d) => acc + (d.deal.value || 0), 0);
        const totalDeals = deals.length;
        const averageValue = totalDeals > 0 ? totalValue / totalDeals : 0;

        // Get unique contacts
        const uniqueContacts = new Set(deals.map(d => d.deal.contactId));

        // Calculate conversion rate (deals in final stage / total deals)
        const finalStage = stages[stages.length - 1];
        const closedDeals = finalStage ? deals.filter(d => d.deal.stageId === finalStage.id).length : 0;
        const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0;

        setMetrics({
            totalDeals,
            totalValue,
            averageValue,
            conversionRate,
            activeContacts: uniqueContacts.size,
        });
    }, [deals, stages]);

    const metricCards = [
        {
            title: 'Negócios Ativos',
            value: metrics.totalDeals,
            icon: Target,
            color: 'blue',
            trend: '+12%',
            trendUp: true,
        },
        {
            title: 'Valor Total em Pipeline',
            value: `R$ ${(metrics.totalValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'green',
            trend: '+8%',
            trendUp: true,
        },
        {
            title: 'Contatos Únicos',
            value: metrics.activeContacts,
            icon: Users,
            color: 'purple',
            trend: '+5%',
            trendUp: true,
        },
        {
            title: 'Taxa de Conversão',
            value: `${metrics.conversionRate.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'orange',
            trend: metrics.conversionRate > 20 ? '+3%' : '-2%',
            trendUp: metrics.conversionRate > 20,
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metricCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg ${getColorClasses(card.color)} flex items-center justify-center`}>
                                <Icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                {card.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                <span>{card.trend}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
