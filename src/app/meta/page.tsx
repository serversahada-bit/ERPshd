import { Suspense } from 'react';
import MetaDashboardOverview from '@/components/views/MetaDashboardOverview';

export default function MetaPage() {
  return (
    <Suspense>
      <MetaDashboardOverview />
    </Suspense>
  );
}
