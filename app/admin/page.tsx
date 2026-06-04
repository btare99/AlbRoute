'use client';

import dynamic from 'next/dynamic';

const BusAdminView = dynamic(() => import('../components/map/BusAdminView'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0a0f1d',
      color: '#3b82f6',
      fontSize: '16px',
      fontWeight: '600'
    }}>
      Loading Admin Panel...
    </div>
  )
});

export default function AdminPage() {
  return <BusAdminView />;
}
