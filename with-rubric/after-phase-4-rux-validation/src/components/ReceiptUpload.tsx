import React, { useState, useRef } from 'react';
import { validateReceiptFile } from '../utils/validation';

interface ReceiptUploadProps {
  onReceiptSelect: (file: File) => void;
  currentReceipt?: {
    base64: string;
    fileName: string;
    fileSize: number;
  };
  isLoading?: boolean;
}

export function ReceiptUpload({ onReceiptSelect, currentReceipt, isLoading = false }: ReceiptUploadProps): React.JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    
    const validationError = validateReceiptFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onReceiptSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Receipt (Optional)
      </label>
      
      {currentReceipt ? (
        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                src={currentReceipt.base64}
                alt="Receipt thumbnail"
                className="h-12 w-12 object-cover rounded border"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{currentReceipt.fileName}</p>
              <p className="text-xs text-gray-500">{formatFileSize(currentReceipt.fileSize)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Change
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">JPEG, PNG, WebP up to 5MB</p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={isLoading}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 