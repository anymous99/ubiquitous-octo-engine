import React from 'react';
import { X, Calendar, MapPin, Link as LinkIcon, User, CheckCircle, XCircle } from 'lucide-react';
import { Event } from '../types';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { loadData, saveData } from '../services/dataService';

interface EventModalProps {
  event: Event;
  onClose: () => void;
  onUpdate?: () => void;
}

export function EventModal({ event, onClose, onUpdate }: EventModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [eventData, setEventData] = React.useState<Event>(event);

  const handleEventAction = async (status: 'approved' | 'rejected') => {
    if (!user || user.role !== 'coordinator') return;

    try {
      setLoading(true);
      setError(null);

      const data = await loadData();
      const updatedEvents = data.events.map(e =>
        e.id === event.id
          ? {
              ...e,
              status,
              ...(status === 'approved'
                ? { approvedAt: new Date().toISOString() }
                : { rejectedAt: new Date().toISOString() })
            }
          : e
      );

      await saveData({
        ...data,
        events: updatedEvents
      });

      setEventData({
        ...eventData,
        status,
        ...(status === 'approved'
          ? { approvedAt: new Date().toISOString() }
          : { rejectedAt: new Date().toISOString() })
      });

      onUpdate?.();
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-64">
          <img 
            src={eventData.image} 
            alt={eventData.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
          {eventData.status && (
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
              eventData.status === 'approved' 
                ? 'bg-green-100 text-green-800'
                : eventData.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {eventData.status.charAt(0).toUpperCase() + eventData.status.slice(1)}
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{eventData.title}</h2>
          <p className="text-gray-600 mb-6">{eventData.description}</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-3" />
              <span>{format(new Date(eventData.date), 'MMMM d, yyyy')} at {eventData.time}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3" />
              <span>{eventData.location}</span>
            </div>
            {eventData.proposedBy && (
              <div className="flex items-center text-gray-600">
                <User className="w-5 h-5 mr-3" />
                <span>Proposed by: {eventData.proposedBy}</span>
              </div>
            )}
          </div>

          {eventData.links && eventData.links.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Important Links</h3>
              <div className="space-y-2">
                {eventData.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 hover:text-indigo-700"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {user?.role === 'coordinator' && eventData.status === 'proposed' && (
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => handleEventAction('rejected')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject Event
              </button>
              <button
                onClick={() => handleEventAction('approved')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Approve Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}