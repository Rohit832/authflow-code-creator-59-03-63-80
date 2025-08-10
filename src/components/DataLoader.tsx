import { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorState } from './LoadingSpinner';

interface DataLoaderProps<T> {
  loadData: () => Promise<T>;
  timeout?: number;
  children: (data: T) => React.ReactNode;
  loadingText?: string;
  errorText?: string;
  dependencies?: any[];
}

export function DataLoader<T>({
  loadData,
  timeout = 8000,
  children,
  loadingText = "Loading...",
  errorText = "Failed to load data",
  dependencies = []
}: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await loadData();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : errorText;
      setError(errorMessage);
      console.error('DataLoader error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  if (loading) {
    return <LoadingSpinner text={loadingText} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchData} />;
  }

  if (!data) {
    return <ErrorState error="No data available" onRetry={fetchData} />;
  }

  return <>{children(data)}</>;
}

export default DataLoader;