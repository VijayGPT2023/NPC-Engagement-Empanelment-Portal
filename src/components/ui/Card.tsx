"use client";

import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export default function Card({
  title,
  children,
  className = "",
  actions,
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          {title && (
            <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
