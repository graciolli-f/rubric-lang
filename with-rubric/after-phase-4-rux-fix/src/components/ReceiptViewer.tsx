import React, { useState } from 'react';

interface ReceiptViewerProps {
  receipt: {
    base64: string;
    fileName: string;
    fileSize: number;
  };
  showThumbnail?: boolean;
  onRemove?: () => void;
}

export function ReceiptViewer({ receipt, showThumbnail = true, onRemove }: ReceiptViewerProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (showThumbnail) {
    return (
      <>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleImageClick}
            className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <img
              src={receipt.base64}
              alt="Receipt thumbnail"
              className="h-8 w-8 object-cover rounded border hover:opacity-80 transition-opacity"
            />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 truncate">{receipt.fileName}</p>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-red-600 hover:text-red-800 focus:outline-none"
              title="Remove receipt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Full-size modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            onClick={handleModalClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <button
                onClick={handleModalClose}
                className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <img
                src={receipt.base64}
                alt="Receipt full size"
                className="max-w-full max-h-full object-contain rounded"
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded">
                <p className="text-sm">{receipt.fileName}</p>
                <p className="text-xs opacity-75">{formatFileSize(receipt.fileSize)}</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Full size display (not thumbnail)
  return (
    <div className="space-y-2">
      <img
        src={receipt.base64}
        alt="Receipt"
        className="max-w-full h-auto rounded border"
      />
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>{receipt.fileName}</span>
        <span>{formatFileSize(receipt.fileSize)}</span>
      </div>
    </div>
  );
} 