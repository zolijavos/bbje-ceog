import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import AdminHeader from './AdminHeader';
import MobileTabBar from './components/MobileTabBar';
import MobileFooter from '../components/MobileFooter';
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
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-20 md:pb-10 transition-colors">
        <AdminHeader />
        {children}
        <MobileFooter bottomOffset="3.5rem" zIndex={50} />
        <MobileTabBar />
      </div>
    </Providers>
  );
}
