import React from 'react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptImage: string;
  expenseDescription: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptImage,
  expenseDescription
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Receipt: {expenseDescription}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
            title="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image container */}
        <div className="flex items-center justify-center p-4 max-h-[calc(90vh-80px)] overflow-auto">
          <img
            src={receiptImage}
            alt={`Receipt for ${expenseDescription}`}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: 'calc(90vh - 120px)' }}
          />
        </div>

        {/* Footer with download option */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <a
              href={receiptImage}
              download={`receipt-${expenseDescription.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition duration-200"
            >
              Download Receipt
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}; 