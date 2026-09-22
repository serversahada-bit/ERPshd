import { Suspense } from 'react';
import ClosingBoxCsView from '@/components/views/ClosingBoxCsView';

export default function ClosingBoxCsPage() {
  return <Suspense fallback={<p className="text-sm text-slate-500">Memuat data...</p>}><ClosingBoxCsView /></Suspense>;
}
