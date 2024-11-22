import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PinModalProps {
  onSubmit: (pin: string) => void;
  onClose: () => void;
}

export function PinModal({ onSubmit, onClose }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    onSubmit(pin);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Enter PIN</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Please enter your 4-digit PIN to continue. Default PIN is 0000.
            </p>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(value);
                setError('');
              }}
              className="w-full text-center text-2xl tracking-widest px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••"
              required
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              disabled={pin.length !== 4}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}