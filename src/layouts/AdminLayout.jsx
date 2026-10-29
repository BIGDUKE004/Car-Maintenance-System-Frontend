import { LayoutDashboard, ShieldCheck, Settings2, Banknote } from 'lucide-react';
import Shell from './Shell';

const nav = {
  label: 'WORKSHOP',
  items: [
    { to: '/admin', end: true, icon: LayoutDashboard, text: 'Requests' },
    { to: '/admin/payments', icon: Banknote, text: 'Payment review' },
    { to: '/admin/workshop', icon: Settings2, text: 'Workshop tools' },
  ],
};

export default function AdminLayout() {
  return (
    <Shell
      nav={nav}
      crumb={{ area: 'Workshop', page: 'Admin console' }}
      account="Workshop admin"
      AccountIcon={ShieldCheck}
      tip={{ title: 'Workshop console.', body: 'Run requests, services and payments for your customers.' }}
    />
  );
}
