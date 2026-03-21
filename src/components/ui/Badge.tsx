"use client";

import React from "react";

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  status?: string;
  label: string;
  size?: BadgeSize;
  className?: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  screening: "bg-orange-50 text-orange-700 border-orange-200",
  shortlisted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  engaged: "bg-emerald-50 text-emerald-700 border-emerald-200",
  empanelled: "bg-teal-50 text-teal-700 border-teal-200",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
  cancelled: "bg-red-100 text-red-600 border-red-300",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

const defaultColor = "bg-gray-100 text-gray-700 border-gray-300";

export default function Badge({
  status,
  label,
  size = "sm",
  className = "",
}: BadgeProps) {
  const colorClass = status
    ? statusColors[status.toLowerCase()] ?? defaultColor
    : defaultColor;

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium whitespace-nowrap
        ${colorClass}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {label}
    </span>
  );
}
