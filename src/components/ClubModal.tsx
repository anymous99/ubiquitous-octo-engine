import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Plus } from 'lucide-react';
import { Club, User, ClubMembership, Event } from '../types';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { loadData, saveData } from '../services/dataService';
import { ProposeEventModal } from './ProposeEventModal';

interface ClubModalProps {
  club: Club;
  onClose: () => void;
}

export function ClubModal({ club, onClose }: ClubModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProposeEvent, setShowProposeEvent] = useState(false);
  const [clubData, setClubData] = useState<{
    coordinator: User | null;
    members: Array<{ user: User; membership: ClubMembership }>;
    events: Event[];
    isMember: boolean;
    hasPendingRequest: boolean;
  }>({
    coordinator: null,
    members: [],
    events: [],
    isMember: false,
    hasPendingRequest: false
  });

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const data = await loadData();
        
        // Get coordinator
        const coordinator = data.users.find(u => u.id === club.coordinatorId);
        
        // Get members with their details
        const members = data.clubMemberships
          .filter(m => m.clubId === club.id)
          .map(membership => {
            const memberUser = data.users.find(u => u.id === membership.userId);
            return memberUser ? { user: memberUser, membership } : null;
          })
          .filter((member): member is { user: User; membership: ClubMembership } => member !== null);

        // Get club events
        const events = data.events.filter(e => e.clubId === club.id);

        // Check if current user is a member
        const isMember = user ? data.clubMemberships.some(
          m => m.userId === user.id && m.clubId === club.id
        ) : false;

        // Check for pending join request
        const hasPendingRequest = user ? data.joinRequests.some(
          r => r.userId === user.id && r.clubId === club.id && r.status === 'pending'
        ) : false;

        setClubData({
          coordinator: coordinator || null,
          members,
          events,
          isMember,
          hasPendingRequest
        });
      } catch (err) {
        console.error('Error loading club data:', err);
        setError('Failed to load club details');
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [club.id, club.coordinatorId, user]);

  const handleJoinRequest = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const data = await loadData();

      // Create new join request
      const newRequest = {
        id: String(data.joinRequests.length + 1),
        userId: user.id,
        clubId: club.id,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      const updatedData = {
        ...data,
        joinRequests: [...data.joinRequests, newRequest]
      };

      await saveData(updatedData);
      setClubData(prev => ({
        ...prev,
        hasPendingRequest: true
      }));
      setSuccess('Join request sent successfully');
    } catch (err) {
      console.error('Error sending join request:', err);
      setError('Failed to send join request');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-64">
          <img 
            src={club.image} 
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="inline-block px-3 py-1 mb-4 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
            {club.category}
          </div>
          <h2 className="text-2xl font-bold mb-2">{club.name}</h2>
          <p className="text-gray-600 mb-6">{club.description}</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Coordinator Info */}
          {clubData.coordinator && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Coordinator</h3>
              <div className="flex items-center bg-gray-50 rounded-lg p-4">
                <img
                  src={clubData.coordinator.avatar}
                  alt={clubData.coordinator.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium">{clubData.coordinator.name}</p>
                  <p className="text-sm text-gray-500">
                    {clubData.coordinator.department} • {clubData.coordinator.regNo}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Members */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Members ({clubData.members.length})
            </h3>
            <div className="space-y-3">
              {clubData.members.slice(0, 5).map(({ user: member, membership }) => (
                <div key={member.id} className="flex items-center bg-gray-50 rounded-lg p-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">
                      {membership.role} • Joined {format(new Date(membership.joinedAt), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
              ))}
              {clubData.members.length > 5 && (
                <p className="text-center text-sm text-gray-500">
                  And {clubData.members.length - 5} more members...
                </p>
              )}
            </div>
          </div>

          {/* Events */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              {clubData.events
                .filter(event => new Date(event.date) >= new Date())
                .map(event => (
                  <div key={event.id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(event.date), 'MMMM d, yyyy')} at {event.time}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            {user?.role === 'student' && clubData.isMember && (
              <button
                onClick={() => setShowProposeEvent(true)}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Propose Event
              </button>
            )}

            {user?.role === 'student' && !clubData.isMember && !clubData.hasPendingRequest && (
              <button
                onClick={handleJoinRequest}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Sending Request...' : 'Request to Join Club'}
              </button>
            )}

            {clubData.hasPendingRequest && (
              <div className="text-center text-yellow-600 font-medium">
                Join request pending approval
              </div>
            )}
          </div>
        </div>
      </div>

      {showProposeEvent && (
        <ProposeEventModal
          club={club}
          onClose={() => setShowProposeEvent(false)}
          onSuccess={() => {
            setShowProposeEvent(false);
            setSuccess('Event proposal submitted successfully');
          }}
        />
      )}
    </div>
  );
}