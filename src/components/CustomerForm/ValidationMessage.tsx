import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'success';
}

export function ValidationMessage({ message, type = 'error' }: ValidationMessageProps) {
  const colors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    success: 'text-green-500'
  };

  return (
    <p className={`mt-1 text-sm flex items-center gap-1 ${colors[type]}`}>
      <AlertCircle className="h-4 w-4" />
      {message}
    </p>
  );
}