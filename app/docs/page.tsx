import { Metadata } from 'next'
import Documentation from '@/components/Documentation'

export const metadata: Metadata = {
  title: 'Documentation | Prism - AI-Powered React Native Builder',
  description: 'Comprehensive documentation for building React Native apps with AI',
}

export default function DocsPage() {
  return <Documentation />
} 