import React from 'react';

export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img 
      src="https://intranet.shapersclub.com/build/images/login.svg"
      alt="Shapers Club Logo"
      className={className}
    />
  );
}