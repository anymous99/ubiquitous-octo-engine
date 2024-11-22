import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, Edit, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { User, Club, Event, ClubMembership, JoinRequest } from '../types';
import { Header } from './Header';
import { ProfileModal } from './ProfileModal';
import { EditClubModal } from './EditClubModal';
import { ManageRequestModal } from './ManageRequestModal';
import { ManageMemberModal } from './ManageMemberModal';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { loadData, saveData } from '../services/dataService';

interface DashboardData {
  users: User[];
  clubs: Club[];
  events: Event[];
  clubMemberships: ClubMembership[];
  joinRequests: JoinRequest[];
}

const initialData: DashboardData = {
  users: [],
  clubs: [],
  events: [],
  clubMemberships: [],
  joinRequests: []
};

export function CoordinatorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditClub, setShowEditClub] = useState(false);
  const [showManageRequest, setShowManageRequest] = useState(false);
  const [showManageMember, setShowManageMember] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [selectedMembership, setSelectedMembership] = useState<ClubMembership | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loadedData = await loadData();
        setData(loadedData);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const coordinatorClub = data.clubs.find(club => club.coordinatorId === user.id);

  if (!coordinatorClub) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onViewProfile={() => setShowProfile(true)} />
        <div className="max-w-7xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, Coordinator!</h2>
          <p className="text-gray-600">You haven't been assigned to any clubs yet.</p>
        </div>
        {showProfile && user && (
          <ProfileModal user={user} onClose={() => setShowProfile(false)} />
        )}
      </div>
    );
  }

  // Get club members with safe checks
  const clubMembers = data.clubMemberships
    .filter(m => m.clubId === coordinatorClub.id)
    .map(membership => {
      const memberUser = data.users.find(u => u.id === membership.userId);
      return memberUser ? { membership, user: memberUser } : null;
    })
    .filter((member): member is { membership: ClubMembership; user: User } => member !== null);

  // Get club events
  const clubEvents = data.events
    .filter(event => event.clubId === coordinatorClub.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get pending requests with safe checks
  const pendingRequests = data.joinRequests
    .filter(req => req.clubId === coordinatorClub.id && req.status === 'pending')
    .map(request => {
      const requestUser = data.users.find(u => u.id === request.userId);
      return requestUser ? { request, user: requestUser } : null;
    })
    .filter((item): item is { request: JoinRequest; user: User } => item !== null);

  const handleEventAction = async (event: Event, status: 'approved' | 'rejected') => {
    try {
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

      const updatedData = {
        ...data,
        events: updatedEvents
      };

      await saveData(updatedData);
      setData(updatedData);
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
    }
  };

  const handleRequestResponse = async (
    request: JoinRequest,
    status: 'approved' | 'rejected',
    responseMessage: string,
    role?: string
  ) => {
    try {
      const updatedRequests = data.joinRequests.map(r =>
        r.id === request.id
          ? {
              ...r,
              status,
              responseMessage,
              respondedAt: new Date().toISOString(),
              assignedRole: role
            }
          : r
      );

      let updatedMemberships = [...data.clubMemberships];

      if (status === 'approved') {
        updatedMemberships.push({
          userId: request.userId,
          clubId: request.clubId,
          joinedAt: new Date().toISOString(),
          role: role || 'member'
        });
      }

      const updatedData = {
        ...data,
        joinRequests: updatedRequests,
        clubMemberships: updatedMemberships
      };

      await saveData(updatedData);
      setData(updatedData);
      setShowManageRequest(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error handling request:', err);
      setError('Failed to process request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onViewProfile={() => setShowProfile(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Information */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative h-48">
            <img 
              src={coordinatorClub.image} 
              alt={coordinatorClub.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setShowEditClub(true)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="inline-block px-3 py-1 mb-4 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
              {coordinatorClub.category}
            </div>
            <h2 className="text-2xl font-bold mb-2">{coordinatorClub.name}</h2>
            <p className="text-gray-600">{coordinatorClub.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Join Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <UserPlus className="w-6 h-6 text-indigo-600 mr-2" />
                <h3 className="text-xl font-semibold">Join Requests</h3>
              </div>
              {pendingRequests.length > 0 && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {pendingRequests.length} pending
                </span>
              )}
            </div>
            <div className="space-y-4">
              {pendingRequests.map(({ request, user: requestUser }) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <img
                      src={requestUser.avatar}
                      alt={requestUser.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{requestUser.name}</p>
                      <p className="text-sm text-gray-500">
                        {requestUser.department} • {requestUser.regNo}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowManageRequest(true);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Review
                  </button>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <p className="text-center text-gray-500">No pending join requests</p>
              )}
            </div>
          </div>

          {/* Club Members */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold">Club Members ({clubMembers.length})</h3>
            </div>
            <div className="space-y-4">
              {clubMembers.map(({ membership, user: member }) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">
                        {membership.role || 'Member'} • {member.department}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMembership(membership);
                      setShowManageMember(true);
                    }}
                    className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    Manage
                  </button>
                </div>
              ))}
              {clubMembers.length === 0 && (
                <p className="text-center text-gray-500">No members yet</p>
              )}
            </div>
          </div>

          {/* Club Events */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Calendar className="w-6 h-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold">Club Events</h3>
            </div>
            <div className="space-y-4">
              {clubEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{event.title}</h4>
                      {event.status && (
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          event.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(event.date), 'MMMM d, yyyy')} at {event.time}
                    </div>
                    {event.proposedBy && (
                      <div className="text-sm text-gray-500 mt-1">
                        Proposed by: {data.users.find(u => u.id === event.proposedBy)?.name}
                      </div>
                    )}
                  </div>
                  {event.status === 'proposed' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEventAction(event, 'approved')}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleEventAction(event, 'rejected')}
                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {clubEvents.length === 0 && (
                <p className="text-center text-gray-500">No events yet</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {showProfile && user && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} />
      )}

      {showManageRequest && selectedRequest && (
        <ManageRequestModal
          request={selectedRequest}
          onClose={() => {
            setShowManageRequest(false);
            setSelectedRequest(null);
          }}
          onSubmit={handleRequestResponse}
        />
      )}

      {showManageMember && selectedMembership && (
        <ManageMemberModal
          membership={selectedMembership}
          onClose={() => {
            setShowManageMember(false);
            setSelectedMembership(null);
          }}
          onSubmit={async (membership, newRole) => {
            try {
              const updatedMemberships = data.clubMemberships.map(m =>
                m.userId === membership.userId && m.clubId === membership.clubId
                  ? { ...m, role: newRole }
                  : m
              );

              const updatedData = {
                ...data,
                clubMemberships: updatedMemberships
              };

              await saveData(updatedData);
              setData(updatedData);
              setShowManageMember(false);
              setSelectedMembership(null);
            } catch (err) {
              console.error('Error updating member role:', err);
              setError('Failed to update member role');
            }
          }}
          onRemove={async (membership) => {
            try {
              const updatedMemberships = data.clubMemberships.filter(
                m => !(m.userId === membership.userId && m.clubId === membership.clubId)
              );

              const updatedData = {
                ...data,
                clubMemberships: updatedMemberships
              };

              await saveData(updatedData);
              setData(updatedData);
              setShowManageMember(false);
              setSelectedMembership(null);
            } catch (err) {
              console.error('Error removing member:', err);
              setError('Failed to remove member');
            }
          }}
        />
      )}

      {showEditClub && coordinatorClub && (
        <EditClubModal
          club={coordinatorClub}
          onClose={() => setShowEditClub(false)}
          onSubmit={async (clubId, updates) => {
            try {
              const updatedClubs = data.clubs.map(club =>
                club.id === clubId ? { ...club, ...updates } : club
              );

              const updatedData = {
                ...data,
                clubs: updatedClubs
              };

              await saveData(updatedData);
              setData(updatedData);
              setShowEditClub(false);
            } catch (err) {
              console.error('Error updating club:', err);
              setError('Failed to update club');
            }
          }}
        />
      )}
    </div>
  );
}