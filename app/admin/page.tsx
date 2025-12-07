import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import DashboardContent from './DashboardContent';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  return <DashboardContent userName={session?.user?.name || ''} />;
}
