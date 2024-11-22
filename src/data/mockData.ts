// Mock data for testing
export const mockData = {
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@college.edu',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random'
    },
    {
      id: '2',
      name: 'John Tech',
      email: 'john@college.edu',
      role: 'coordinator',
      department: 'Computer Science',
      regNo: 'COORD001',
      avatar: 'https://ui-avatars.com/api/?name=John+Tech&background=random'
    },
    {
      id: '3',
      name: 'Mike Student',
      email: 'mike@college.edu',
      role: 'student',
      department: 'Computer Science',
      regNo: 'STU001',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Student&background=random'
    }
  ],
  pins: {
    'admin@college.edu': '0000',
    'john@college.edu': '0000',
    'mike@college.edu': '0000'
  },
  clubs: [],
  events: [],
  clubMemberships: [],
  joinRequests: [],
  customRoles: []
};

// Export individual collections for direct access
export const {
  users,
  clubs,
  events,
  clubMemberships,
  joinRequests,
  customRoles,
  pins
} = mockData;