import React from 'react';
import { X } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export function UnsavedChangesModal({ isOpen, onClose, onDiscard, onSave }: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Unsaved Changes
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You have unsaved changes. Would you like to save them before leaving?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onSave}
              className="btn-primary w-full sm:ml-3 sm:w-auto"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onDiscard}
              className="mt-3 w-full sm:mt-0 sm:w-auto btn-secondary"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}