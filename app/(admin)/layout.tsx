import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
