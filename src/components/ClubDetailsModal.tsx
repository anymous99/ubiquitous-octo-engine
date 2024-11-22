import React from 'react';
import { X, Users, Calendar } from 'lucide-react';
import { Club, User, ClubMembership, Event } from '../types';
import { format } from 'date-fns';

interface ClubDetailsModalProps {
  club: Club;
  coordinator?: User;
  members: Array<{ user: User; membership: ClubMembership }>;
  events: Event[];
  onClose: () => void;
}

export function ClubDetailsModal({ club, coordinator, members, events, onClose }: ClubDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-48">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coordinator Info */}
            {coordinator && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Coordinator</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <img
                      src={coordinator.avatar}
                      alt={coordinator.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-medium">{coordinator.name}</p>
                      <p className="text-sm text-gray-500">
                        {coordinator.department} • {coordinator.regNo}
                      </p>
                      <p className="text-sm text-gray-500">{coordinator.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Members</h3>
                <span className="text-sm text-gray-500">{members.length} total</span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {members.map(({ user, membership }) => (
                  <div key={user.id} className="flex items-center bg-gray-50 rounded-lg p-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {membership.role} • Joined {format(new Date(membership.joinedAt), 'MMM yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No members yet</p>
                )}
              </div>
            </div>

            {/* Events */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Events</h3>
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(event.date), 'MMMM d, yyyy')} at {event.time}
                    </div>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No events yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}