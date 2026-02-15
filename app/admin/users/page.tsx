import { Metadata } from 'next';
import UsersDashboard from './UsersDashboard';

export const metadata: Metadata = {
  title: 'Users - Admin | CEO Gala 2026',
  description: 'Manage admin and staff users',
};

export default function UsersPage() {
  return <UsersDashboard />;
}
