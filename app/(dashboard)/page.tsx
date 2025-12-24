'use client';

import { useState } from 'react';
import DealsKanban from '@/components/DealsKanban';
import NewDealModal from '@/components/NewDealModal';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline de Vendas</h1>
          <p className="text-gray-600 mt-1">Gerencie seus negócios em andamento</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Negócio
        </button>
      </div>

      <DealsKanban key={refreshKey} />

      <NewDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
