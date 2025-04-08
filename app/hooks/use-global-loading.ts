import { useContext } from 'react';
import { LoadingContext } from '~/components/common/GlobalLoading';
import type { LoadingContextType } from '~/types/global';

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};