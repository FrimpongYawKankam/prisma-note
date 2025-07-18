import { mockUser } from './users';

// Mock events data (assuming you have events in your app)
export interface MockEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string;
  type: 'meeting' | 'personal' | 'work' | 'social';
  ownerEmail: string;
}

export const mockEvents: MockEvent[] = [
  {
    id: 1,
    title: 'Team Standup Meeting',
    description: 'Daily standup with development team to discuss progress and blockers.',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    location: 'Conference Room A',
    type: 'meeting',
    ownerEmail: mockUser.email
  },
  {
    id: 2,
    title: 'Dentist Appointment',
    description: 'Regular dental checkup and cleaning.',
    date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    location: 'Downtown Dental Clinic',
    type: 'personal',
    ownerEmail: mockUser.email
  },
  {
    id: 3,
    title: 'Project Deadline',
    description: 'Final submission for the PrismaNote app project.',
    date: new Date(Date.now() + 86400000 * 7).toISOString(), // 1 week from now
    location: 'Online',
    type: 'work',
    ownerEmail: mockUser.email
  },
  {
    id: 4,
    title: 'Coffee with Sarah',
    description: 'Catch up with Sarah at the local coffee shop.',
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    location: 'Central Perk Cafe',
    type: 'social',
    ownerEmail: mockUser.email
  },
  {
    id: 5,
    title: 'Gym Session',
    description: 'Leg day workout session.',
    date: new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
    location: 'FitLife Gym',
    type: 'personal',
    ownerEmail: mockUser.email
  }
];
