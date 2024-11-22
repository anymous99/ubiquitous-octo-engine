import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Club } from '../types';
import { useAuth } from '../context/AuthContext';
import { loadData, saveData } from '../services/dataService';

interface ProposeEventModalProps {
  club: Club;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProposeEventModal({ club, onClose, onSuccess }: ProposeEventModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image: '',
    links: [{ name: '', url: '' }]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const data = await loadData();

      const newEvent = {
        id: String(data.events.length + 1),
        ...formData,
        clubId: club.id,
        registeredUsers: [],
        status: 'proposed',
        proposedBy: user.id,
        proposedAt: new Date().toISOString()
      };

      const updatedData = {
        ...data,
        events: [...data.events, newEvent]
      };

      await saveData(updatedData);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error proposing event:', err);
      setError('Failed to propose event');
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { name: '', url: '' }]
    });
  };

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index)
    });
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...formData.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({ ...formData, links: newLinks });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Propose Event for {club.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Image URL
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

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Important Links
              </label>
              <button
                type="button"
                onClick={addLink}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Link
              </button>
            </div>
            <div className="space-y-3">
              {formData.links.map((link, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Link Name"
                    required
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={link.name}
                    onChange={(e) => updateLink(index, 'name', e.target.value)}
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    required
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Proposing...' : 'Propose Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}