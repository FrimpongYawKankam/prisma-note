// Types and interfaces for API DTOs and responses

// ============================================
// AUTH TYPES
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
}

export interface ChangePasswordRequest {
  email?: string;
  otp?: string;
  newPassword: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  isVerified?: boolean;
  role?: string;
}

// ============================================
// NOTE TYPES
// ============================================

export interface CreateNoteRequest {
  title: string;
  content?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

export interface NoteResponse {
  id: number;
  title: string;
  content?: string;
  timeCreated: string; // ISO datetime string
  lastModified: string; // ISO datetime string
  ownerName: string;
  ownerEmail: string;
}

// ============================================
// API RESPONSE WRAPPERS
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ErrorResponse {
  message: string;
  status?: number;
  error?: string;
}

// ============================================
// FRONTEND-SPECIFIC TYPES
// ============================================

export interface Note {
  id: number;
  title: string;
  content?: string;
  timeCreated: Date;
  lastModified: Date;
  ownerName: string;
  ownerEmail: string;
}

// Utility type for API errors
export interface ApiError {
  response?: {
    status: number;
    data: {
      message?: string;
      error?: string;
    };
  };
  message: string;
  request?: any;
}

// Search and filtering types
export interface SearchParams {
  keyword?: string;
  limit?: number;
  offset?: number;
}

export interface NotesListResponse {
  notes: NoteResponse[];
  total: number;
}

// ============================================
// EVENT TYPES
// ============================================

export enum EventTag {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface EventRequest {
  title: string;
  description?: string;
  startDateTime: string; // ISO string format
  endDateTime: string;   // ISO string format
  tag: EventTag;
  allDay: boolean;
}

export interface CreateEventRequest extends EventRequest {}

export interface UpdateEventRequest extends Partial<EventRequest> {}

export interface EventResponse {
  id: number;
  title: string;
  description?: string;
  startDateTime: string; // ISO string from backend
  endDateTime: string;   // ISO string from backend
  userId: number;
  createdAt: string;     // ISO string from backend
  updatedAt: string;     // ISO string from backend
  tag: EventTag;
  allDay: boolean;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  startDateTime: Date;   // Converted to Date object for frontend use
  endDateTime: Date;     // Converted to Date object for frontend use
  userId: number;
  createdAt: Date;       // Converted to Date object for frontend use
  updatedAt: Date;       // Converted to Date object for frontend use
  tag: EventTag;
  allDay: boolean;
}

// Search and filter parameters for events
export interface EventSearchParams {
  userId?: number;
  from?: string;         // ISO date string
  to?: string;           // ISO date string
  tag?: EventTag;
}

// Common response types
export type MessageResponse = {
  message: string;
};

export type CountResponse = {
  count: number;
};
