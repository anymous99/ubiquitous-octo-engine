import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, Download } from 'lucide-react';
import { User, Club, Event } from '../types';
import { Header } from './Header';
import { ProfileModal } from './ProfileModal';
import { CreateCoordinatorModal } from './CreateCoordinatorModal';
import { CreateClubModal } from './CreateClubModal';
import { CreateStudentModal } from './CreateStudentModal';
import { ClubDetailsModal } from './ClubDetailsModal';
import { loadData, saveData } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

export function AdminDashboard() {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateCoordinator, setShowCreateCoordinator] = useState(false);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const coordinators = data.users.filter((u: User) => u.role === 'coordinator');
  const students = data.users.filter((u: User) => u.role === 'student');

  const handleExportData = () => {
    const exportData = {
      users: data.users,
      clubs: data.clubs,
      events: data.events,
      clubMemberships: data.clubMemberships,
      joinRequests: data.joinRequests
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus_life_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRemoveUser = async (userToRemove: User) => {
    if (!window.confirm(`Are you sure you want to remove ${userToRemove.name}?`)) {
      return;
    }

    try {
      const updatedData = {
        ...data,
        users: data.users.filter((u: User) => u.id !== userToRemove.id),
        clubMemberships: data.clubMemberships.filter((m: any) => m.userId !== userToRemove.id),
        joinRequests: data.joinRequests.filter((r: any) => r.userId !== userToRemove.id),
        events: data.events.map((e: Event) => ({
          ...e,
          registeredUsers: e.registeredUsers.filter(id => id !== userToRemove.id)
        }))
      };

      if (userToRemove.role === 'coordinator') {
        updatedData.clubs = data.clubs.filter((club: Club) => club.coordinatorId !== userToRemove.id);
      }

      await saveData(updatedData);
      setData(updatedData);
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user');
    }
  };

  const handleRemoveClub = async (clubToRemove: Club) => {
    if (!window.confirm(`Are you sure you want to remove ${clubToRemove.name}?`)) {
      return;
    }

    try {
      const updatedData = {
        ...data,
        clubs: data.clubs.filter((c: Club) => c.id !== clubToRemove.id),
        clubMemberships: data.clubMemberships.filter((m: any) => m.clubId !== clubToRemove.id),
        joinRequests: data.joinRequests.filter((r: any) => r.clubId !== clubToRemove.id),
        events: data.events.filter((e: Event) => e.clubId !== clubToRemove.id)
      };

      await saveData(updatedData);
      setData(updatedData);
    } catch (err) {
      console.error('Error removing club:', err);
      setError('Failed to remove club');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onViewProfile={() => setShowProfile(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleExportData}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coordinators Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Coordinators</h2>
              <button
                onClick={() => setShowCreateCoordinator(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Coordinator
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {coordinators.map((coordinator: User) => (
                  <div key={coordinator.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <img
                        src={coordinator.avatar}
                        alt={coordinator.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium">{coordinator.name}</p>
                        <p className="text-sm text-gray-500">
                          {coordinator.department} • {coordinator.regNo}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(coordinator)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Students Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Students</h2>
              <button
                onClick={() => setShowCreateStudent(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Student
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {students.map((student: User) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">
                          {student.department} • {student.regNo}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(student)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clubs Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Clubs</h2>
              <button
                onClick={() => setShowCreateClub(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Club
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.clubs.map((club: Club) => {
                const coordinator = data.users.find((u: User) => u.id === club.coordinatorId);
                const memberCount = data.clubMemberships.filter((m: any) => m.clubId === club.id).length;

                return (
                  <div key={club.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={club.image} 
                        alt={club.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="inline-block px-3 py-1 mb-4 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                        {club.category}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{club.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{club.description}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{memberCount} members</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedClub(club)}
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleRemoveClub(club)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {showProfile && user && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} />
      )}

      {showCreateCoordinator && (
        <CreateCoordinatorModal
          onClose={() => setShowCreateCoordinator(false)}
          onSubmit={async (formData) => {
            try {
              const newUser: User = {
                id: String(data.users.length + 1),
                name: formData.name,
                email: formData.email,
                role: 'coordinator',
                regNo: formData.regNo,
                department: formData.department,
                phone: formData.phone,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
              };

              const updatedData = {
                ...data,
                users: [...data.users, newUser],
                pins: {
                  ...data.pins,
                  [formData.email]: '0000'
                }
              };

              await saveData(updatedData);
              setData(updatedData);
              setShowCreateCoordinator(false);
            } catch (err) {
              console.error('Error creating coordinator:', err);
              setError('Failed to create coordinator');
            }
          }}
        />
      )}

      {showCreateStudent && (
        <CreateStudentModal
          onClose={() => setShowCreateStudent(false)}
          onSubmit={async (formData) => {
            try {
              const newUser: User = {
                id: String(data.users.length + 1),
                name: formData.name,
                email: formData.email,
                role: 'student',
                regNo: formData.regNo,
                department: formData.department,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
              };

              const updatedData = {
                ...data,
                users: [...data.users, newUser],
                pins: {
                  ...data.pins,
                  [formData.email]: '0000'
                }
              };

              await saveData(updatedData);
              setData(updatedData);
              setShowCreateStudent(false);
            } catch (err) {
              console.error('Error creating student:', err);
              setError('Failed to create student');
            }
          }}
        />
      )}

      {showCreateClub && (
        <CreateClubModal
          coordinators={coordinators}
          onClose={() => setShowCreateClub(false)}
          onSubmit={async (formData) => {
            try {
              const newClub: Club = {
                id: String(data.clubs.length + 1),
                name: formData.name,
                description: formData.description,
                coordinatorId: formData.coordinatorId,
                image: formData.image,
                category: formData.category,
                createdAt: new Date().toISOString(),
                createdBy: user?.id || ''
              };

              const updatedData = {
                ...data,
                clubs: [...data.clubs, newClub]
              };

              await saveData(updatedData);
              setData(updatedData);
              setShowCreateClub(false);
            } catch (err) {
              console.error('Error creating club:', err);
              setError('Failed to create club');
            }
          }}
        />
      )}

      {selectedClub && (
        <ClubDetailsModal
          club={selectedClub}
          coordinator={data.users.find((u: User) => u.id === selectedClub.coordinatorId)}
          members={data.clubMemberships
            .filter((m: any) => m.clubId === selectedClub.id)
            .map((membership: any) => ({
              user: data.users.find((u: User) => u.id === membership.userId),
              membership
            }))}
          events={data.events.filter((e: Event) => e.clubId === selectedClub.id)}
          onClose={() => setSelectedClub(null)}
        />
      )}
    </div>
  );
}