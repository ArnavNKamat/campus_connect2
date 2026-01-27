export type UserRole = 'student' | 'admin';

export interface Location {
  id: string;
  name: string;
  building: string;
  floor: string;
  roomNumber?: string;
  lat: number;
  lng: number;
  category: 'department' | 'lab' | 'staff' | 'amenity' | 'admin' | 'hostel';
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  department: string;
  photo: string;
  locationId: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  type: 'academic' | 'cultural' | 'sports';
  bannerImage: string;
  venue: string;
  venueDetails?: string;
}

export interface PollOption {
  id: string;
  text: string;
  count: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'alert' | 'success' | 'poll';
  pollOptions?: PollOption[];
  votedOptionId?: string | null; // <--- CHANGED THIS (Was hasVoted)
  isDeleted?: boolean;
  isEdited?: boolean;
}