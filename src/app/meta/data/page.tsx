import { Suspense } from 'react';
import MetaAdsPerformanceTable from '@/components/views/MetaAdsPerformanceTable';

export default function MetaDataPage() {
  return (
    <Suspense>
      <MetaAdsPerformanceTable />
    </Suspense>
  );
}
