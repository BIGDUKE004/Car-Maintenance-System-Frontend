import { CarFront, CircleUserRound, ClipboardList, LayoutDashboard } from 'lucide-react';
import Shell from './Shell';

const nav = {
  label: 'WORKSPACE',
  items: [
    { to: '/app', end: true, icon: LayoutDashboard, text: 'Overview' },
    { to: '/app/vehicles', icon: CarFront, text: 'My vehicles' },
    { to: '/app/requests', icon: ClipboardList, text: 'Maintenance' },
  ],
};

export default function DashboardLayout() {
  return (
    <Shell
      nav={nav}
      crumb={{ area: 'Workspace', page: 'Customer portal' }}
      account="My account"
      AccountIcon={CircleUserRound}
      tip={{ title: 'Keep moving.', body: 'Your maintenance history, all in one place.' }}
    />
  );
}
