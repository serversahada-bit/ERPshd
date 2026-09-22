import { Suspense } from 'react';
import MetaLiveDashboard from '@/components/views/MetaLiveDashboard';

export default function MetaLivePage() {
  return (
    <Suspense>
      <MetaLiveDashboard />
    </Suspense>
  );
}
