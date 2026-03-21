"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import Input from "./Input";

type DocumentType = "qualification" | "experience" | "aadhaar" | "photo" | "cv";

interface KeyDetails {
  [key: string]: string;
}

interface FileUploadProps {
  documentType: DocumentType;
  onUpload: (file: File, keyDetails: KeyDetails) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  required?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  documentType,
  onUpload,
  accept,
  maxSize = 5,
  label,
  required = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keyDetails, setKeyDetails] = useState<KeyDetails>({});

  const validateAndSet = useCallback(
    (selectedFile: File) => {
      setError(null);

      if (maxSize && selectedFile.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds ${maxSize} MB limit.`);
        return;
      }

      setFile(selectedFile);
      setKeyDetails({});

      // Generate image preview
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }

      // Simulate upload progress
      setProgress(0);
      let current = 0;
      const interval = setInterval(() => {
        current += Math.random() * 30 + 10;
        if (current >= 100) {
          current = 100;
          clearInterval(interval);
          setProgress(100);
        } else {
          setProgress(Math.round(current));
        }
      }, 200);
    },
    [maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) validateAndSet(droppedFile);
    },
    [validateAndSet]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) validateAndSet(selectedFile);
    },
    [validateAndSet]
  );

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setProgress(null);
    setKeyDetails({});
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const updateDetail = (field: string, value: string) => {
    setKeyDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (file) onUpload(file, keyDetails);
  };

  const renderKeyDetailsForm = () => {
    if (!file || progress !== 100) return null;

    switch (documentType) {
      case "qualification":
        return (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 rounded border border-gray-200 bg-gray-50 p-4">
            <p className="col-span-full text-sm font-medium text-gray-700">
              Qualification Details
            </p>
            <Input
              label="College / Institute"
              name="college"
              value={keyDetails.college ?? ""}
              onChange={(e) => updateDetail("college", e.target.value)}
              required
            />
            <Input
              label="University / Board"
              name="university"
              value={keyDetails.university ?? ""}
              onChange={(e) => updateDetail("university", e.target.value)}
              required
            />
            <Input
              label="Year of Passing"
              name="year"
              type="number"
              value={keyDetails.year ?? ""}
              onChange={(e) => updateDetail("year", e.target.value)}
              required
            />
            <Input
              label="Degree / Certificate"
              name="degree"
              value={keyDetails.degree ?? ""}
              onChange={(e) => updateDetail("degree", e.target.value)}
              required
            />
            <Input
              label="Marks / CGPA"
              name="marks"
              value={keyDetails.marks ?? ""}
              onChange={(e) => updateDetail("marks", e.target.value)}
              required
            />
          </div>
        );

      case "experience":
        return (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 rounded border border-gray-200 bg-gray-50 p-4">
            <p className="col-span-full text-sm font-medium text-gray-700">
              Experience Details
            </p>
            <Input
              label="Organization"
              name="organization"
              value={keyDetails.organization ?? ""}
              onChange={(e) => updateDetail("organization", e.target.value)}
              required
            />
            <Input
              label="Designation"
              name="designation"
              value={keyDetails.designation ?? ""}
              onChange={(e) => updateDetail("designation", e.target.value)}
              required
            />
            <Input
              label="Period (e.g., Jan 2020 - Dec 2023)"
              name="period"
              value={keyDetails.period ?? ""}
              onChange={(e) => updateDetail("period", e.target.value)}
              required
            />
          </div>
        );

      case "aadhaar":
        return (
          <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-4">
            <Input
              label="Aadhaar Number"
              name="aadhaarNumber"
              value={keyDetails.aadhaarNumber ?? ""}
              onChange={(e) => updateDetail("aadhaarNumber", e.target.value)}
              placeholder="XXXX XXXX XXXX"
              required
            />
          </div>
        );

      case "photo":
        return preview ? (
          <div className="mt-3 flex justify-center">
            <img
              src={preview}
              alt="Uploaded photo preview"
              className="h-32 w-32 rounded border border-gray-200 object-cover"
            />
          </div>
        ) : null;

      case "cv":
        return (
          <div className="mt-3 flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-3">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">{file.name}</span>
            <span className="ml-auto text-xs text-gray-400">
              {formatFileSize(file.size)}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}

      {!file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            flex cursor-pointer flex-col items-center justify-center gap-2
            rounded border-2 border-dashed p-6 transition-colors duration-150
            ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400"}
          `}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            Drag &amp; drop a file here, or{" "}
            <span className="font-medium text-blue-700 underline">browse</span>
          </p>
          <p className="text-xs text-gray-400">
            {accept ? `Accepted: ${accept}` : "All file types"} &middot; Max{" "}
            {maxSize} MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        aria-label={label ?? "File upload"}
      />

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {file && progress !== null && (
        <div className="rounded border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {preview ? (
                <ImageIcon className="h-5 w-5 text-blue-600" />
              ) : (
                <FileText className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {progress < 100 && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">{progress}% uploaded</p>
            </div>
          )}

          {progress === 100 && (
            <p className="mt-1 text-xs text-green-600">Upload complete</p>
          )}
        </div>
      )}

      {renderKeyDetailsForm()}

      {file && progress === 100 && (
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-2 self-start rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
        >
          Confirm &amp; Save
        </button>
      )}
    </div>
  );
}
