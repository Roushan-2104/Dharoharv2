import React from 'react';

export default function StructuralGrid({ children }) {
  return (
    <div className="relative min-h-screen w-full bg-paper text-ink">
      {children}
    </div>
  );
}
