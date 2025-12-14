import { Metadata } from 'next';
import EmailLogsDashboard from './EmailLogsDashboard';

export const metadata: Metadata = {
  title: 'Email Logs - Admin | CEO Gala 2026',
  description: 'View sent email history',
};

export default function EmailLogsPage() {
  return <EmailLogsDashboard />;
}
