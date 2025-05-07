// src/components/layout/AuthGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const isAuthenticated = true; // TODO: เปลี่ยนเป็นตรวจ token จริงในภายหลัง

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}