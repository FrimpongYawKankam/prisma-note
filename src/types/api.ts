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

// Common response types
export type MessageResponse = {
  message: string;
};

export type CountResponse = {
  count: number;
};
