import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../types';

interface CreateClubModalProps {
  coordinators: User[];
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    category: string;
    coordinatorId: string;
    image: string;
  }) => void;
}

export function CreateClubModal({ coordinators, onClose, onSubmit }: CreateClubModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    coordinatorId: '',
    image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Club</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Club Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coordinator
            </label>
            <select
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.coordinatorId}
              onChange={(e) => setFormData({ ...formData, coordinatorId: e.target.value })}
            >
              <option value="">Select a coordinator</option>
              {coordinators.map(coordinator => (
                <option key={coordinator.id} value={coordinator.id}>
                  {coordinator.name} ({coordinator.department})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
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
            >
              Create Club
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}