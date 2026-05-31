'use client';

import { Suspense, ReactNode } from 'react';

export function SearchParamsWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
