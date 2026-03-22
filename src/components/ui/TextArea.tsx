"use client";

import React from "react";

interface TextAreaProps {
  label?: string;
  name: string;
  error?: string;
  required?: boolean;
  rows?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function TextArea({
  label,
  name,
  error,
  required = false,
  rows = 4,
  value,
  onChange,
  maxLength,
  placeholder,
  disabled = false,
  className = "",
}: TextAreaProps) {
  const charCount = value?.length ?? 0;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`
          block w-full rounded border px-3 py-2 text-sm text-gray-900 resize-y
          placeholder:text-gray-400 transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
        `}
      />
      <div className="flex items-center justify-between">
        {error && (
          <p id={`${name}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {maxLength && (
          <p className="ml-auto text-xs text-gray-400">
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
