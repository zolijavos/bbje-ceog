import { Metadata } from 'next';
import DiagramsIframe from './DiagramsIframe';

export const metadata: Metadata = {
  title: 'Testing Hub - Admin | CEO Gala 2026',
  description: 'Diagrams, test cases, and journey test videos',
};

export default function DiagramsPage() {
  return <DiagramsIframe />;
}
