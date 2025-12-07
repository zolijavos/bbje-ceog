import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import AdminHeader from './AdminHeader';
import MobileTabBar from './components/MobileTabBar';
import Providers from './Providers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <Providers>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-16 md:pb-0 transition-colors">
        <AdminHeader />
        {children}
        <MobileTabBar />
      </div>
    </Providers>
  );
}
