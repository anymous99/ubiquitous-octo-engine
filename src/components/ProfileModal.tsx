import React, { useState } from 'react';
import { X, Mail, Phone, BookOpen, Building, Calendar, Lock } from 'lucide-react';
import { User } from '../types';
import { format } from 'date-fns';
import { loadData, saveData } from '../services/dataService';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

export function ProfileModal({ user, onClose }: ProfileModalProps) {
  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (newPin !== confirmPin) {
        setError('New PINs do not match');
        return;
      }

      if (!/^\d{4}$/.test(newPin)) {
        setError('PIN must be exactly 4 digits');
        return;
      }

      const data = await loadData();
      const userPin = data.pins?.[user.email] || '0000';

      if (currentPin !== userPin) {
        setError('Current PIN is incorrect');
        return;
      }

      const updatedData = {
        ...data,
        pins: {
          ...(data.pins || {}),
          [user.email]: newPin
        }
      };

      await saveData(updatedData);
      setSuccess('PIN updated successfully');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      setError('Failed to update PIN');
      console.error('Error updating PIN:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-500">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-6">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-white mr-4"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 capitalize">{user.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-5 h-5 mr-3" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.regNo && (
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="w-5 h-5 mr-3" />
                      <span>{user.regNo}</span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center text-gray-600">
                      <Building className="w-5 h-5 mr-3" />
                      <span>{user.department}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Security</h3>
                <button
                  onClick={() => setShowPinChange(!showPinChange)}
                  className="flex items-center px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Change PIN
                </button>

                {showPinChange && (
                  <form onSubmit={handlePinChange} className="mt-4 space-y-4">
                    {error && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}
                    {success && (
                      <p className="text-sm text-green-600">{success}</p>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current PIN
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        required
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New PIN
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        required
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New PIN
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        required
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Update PIN
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}