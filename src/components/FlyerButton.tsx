'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';
import { Report } from '@/types';
import { FlyerModal } from './FlyerModal';

interface FlyerButtonProps {
  report: Report;
}

export function FlyerButton({ report }: FlyerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center gap-2 flex-1 glass-active hover:bg-brand text-brand-light hover:text-white py-3 px-4 rounded-xl font-bold transition-all border border-brand/30"
        title="Generar Cartel"
      >
        <Printer className="w-5 h-5" />
        <span className="font-bold">Cartel</span>
      </button>

      {isModalOpen && (
        <FlyerModal report={report} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
