'use client';

import { useAuth } from './auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'finance' | 'super_admin';
}

export function AdminGuard({ children, requiredRole = 'admin' }: AdminGuardProps) {
  const { isAdmin, loading, user, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/admin/login');
      return;
    }

    if (!isAdmin) {
      router.replace('/admin/login');
      return;
    }

    if (requiredRole === 'super_admin' && userRole !== 'super_admin') {
      router.push('/admin/dashboard');
      return;
    }
  }, [isAdmin, loading, router, requiredRole, user, userRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
