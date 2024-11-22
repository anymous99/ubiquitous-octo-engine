import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { loadData } from '../services/dataService';
import { PinModal } from './PinModal';

export function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await loadData();
        setUsers(data.users || []);
      } catch (err) {
        setError('Failed to load users');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowPinModal(true);
    setError(null);
  };

  const handlePinSubmit = async (pin: string) => {
    if (!selectedUser) return;
    
    try {
      await login(selectedUser.email, pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setShowPinModal(false);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Group users by role
  const groupedUsers = users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Campus Life
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select your profile to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(groupedUsers).map(([role, roleUsers]) => (
              <div key={role}>
                <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                  {role}s
                </h3>
                <div className="space-y-3">
                  {roleUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-4"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-full capitalize">
                            {user.role}
                          </span>
                          {user.department && (
                            <span className="text-sm text-gray-500">
                              {user.department}
                            </span>
                          )}
                          {user.regNo && (
                            <span className="text-sm text-gray-500">
                              • {user.regNo}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Default PIN for all accounts is: <span className="font-medium">0000</span>
            </p>
          </div>
        </div>
      </div>

      {showPinModal && (
        <PinModal
          onSubmit={handlePinSubmit}
          onClose={() => {
            setShowPinModal(false);
            setSelectedUser(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
}