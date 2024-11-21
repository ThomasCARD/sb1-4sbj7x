import React from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
}

export function FormInput({ 
  label, 
  error, 
  icon: Icon, 
  className, 
  ...props 
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-100 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={clsx(
            "input-primary",
            Icon && "pl-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}