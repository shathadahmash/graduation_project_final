// apiConfig.ts

// Base URL from environment
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper to build full endpoint URL
const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: buildUrl('/auth/login'),
    LOGOUT: buildUrl('/auth/logout'),
    REGISTER: buildUrl('/auth/register'),
    PROFILE: buildUrl('/auth/profile'),
    REFRESH: buildUrl('/auth/refresh'),
  },

  GROUPS: {
    LIST: buildUrl('/groups'),
    CREATE: buildUrl('/groups'),
    DETAIL: (id: number) => buildUrl(`/groups/${id}`),
    UPDATE: (id: number) => buildUrl(`/groups/${id}`),
    DELETE: (id: number) => buildUrl(`/groups/${id}`),
    MEMBERS: (id: number) => buildUrl(`/groups/${id}/members`),
    SUPERVISORS: (id: number) => buildUrl(`/groups/${id}/supervisors`),
  },

  USERS: {
    LIST: buildUrl('/users'),
    DETAIL: (id: number) => buildUrl(`/users/${id}`),
    UPDATE: (id: number) => buildUrl(`/users/${id}`),
    DELETE: (id: number) => buildUrl(`/users/${id}`),
  },

  INVITATIONS: {
    LIST: buildUrl('/invitations'),
    CREATE: buildUrl('/invitations'),
    DETAIL: (id: number) => buildUrl(`/invitations/${id}`),
    ACCEPT: (id: number) => buildUrl(`/invitations/${id}/accept`),
    REJECT: (id: number) => buildUrl(`/invitations/${id}/reject`),
  },

  NOTIFICATIONS: {
    LIST: buildUrl('/notifications'),
    DETAIL: (id: number) => buildUrl(`/notifications/${id}`),
    MARK_READ: (id: number) => buildUrl(`/notifications/${id}/mark-read`),
    MARK_ALL_READ: buildUrl('/notifications/mark-all-read'),
    DELETE: (id: number) => buildUrl(`/notifications/${id}`),
    UNREAD_COUNT: buildUrl('/notifications/unread-count'),
  },

  APPROVALS: {
    LIST: buildUrl('/approvals'),
    DETAIL: (id: number) => buildUrl(`/approvals/${id}`),
    APPROVE: (id: number) => buildUrl(`/approvals/${id}/approve`),
    REJECT: (id: number) => buildUrl(`/approvals/${id}/reject`),
  },

 PROJECTS: {
  LIST: buildUrl('/projects'),
  PUBLIC: buildUrl('/projects/public'),  // <- new public projects endpoint
  CREATE: buildUrl('/projects'),
  DETAIL: (id: number) => buildUrl(`/projects/${id}`),
  UPDATE: (id: number) => buildUrl(`/projects/${id}`),
  DELETE: (id: number) => buildUrl(`/projects/${id}`),
},

  COLLEGES: {
    LIST: buildUrl('/colleges'),
    CREATE: buildUrl('/colleges'),
    DETAIL: (id: number) => buildUrl(`/colleges/${id}`),
    UPDATE: (id: number) => buildUrl(`/colleges/${id}`),
    DELETE: (id: number) => buildUrl(`/colleges/${id}`),
  },

  UNIVERSITIES: {
    LIST: buildUrl('/universities'),
    CREATE: buildUrl('/universities'),
    DETAIL: (id: number) => buildUrl(`/universities/${id}`),
    UPDATE: (id: number) => buildUrl(`/universities/${id}`),
    DELETE: (id: number) => buildUrl(`/universities/${id}`),
  },

  PROGRAMS: {
    LIST: buildUrl('/programs'),
    CREATE: buildUrl('/programs'),
    DETAIL: (id: number) => buildUrl(`/programs/${id}`),
    UPDATE: (id: number) => buildUrl(`/programs/${id}`),
    DELETE: (id: number) => buildUrl(`/programs/${id}`),
  },

  DEPARTMENTS: {
    LIST: buildUrl('/departments'),
    CREATE: buildUrl('/departments'),
    DETAIL: (id: number) => buildUrl(`/departments/${id}`),
    UPDATE: (id: number) => buildUrl(`/departments/${id}`),
    DELETE: (id: number) => buildUrl(`/departments/${id}`),
  },
};

// Role Types
export const ROLES = {
  STUDENT: 'Student',
  SUPERVISOR: 'Supervisor',
  CO_SUPERVISOR: 'Co-supervisor',
  DEPARTMENT_HEAD: 'Department Head',
  DEAN: 'Dean',
  UNIVERSITY_PRESIDENT: 'University President',
  SYSTEM_MANAGER: 'System Manager',
  EXTERNAL_COMPANY: 'External Company',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INVITATION: 'invitation',
  INVITATION_ACCEPTED: 'invitation_accepted',
  INVITATION_REJECTED: 'invitation_rejected',
  INVITATION_EXPIRED: 'invitation_expired',
  APPROVAL_REQUEST: 'approval_request',
  APPROVAL_APPROVED: 'approval_approved',
  APPROVAL_REJECTED: 'approval_rejected',
  SYSTEM_ALERT: 'system_alert',
  SYSTEM_INFO: 'system_info',
  REMINDER: 'reminder',
} as const;

// Approval Status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RETURNED: 'returned',
} as const;

// Invitation Status
export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

// Colors for Roles
export const ROLE_COLORS: Record<string, string> = {
  [ROLES.STUDENT]: 'bg-blue-100 text-blue-800',
  [ROLES.SUPERVISOR]: 'bg-purple-100 text-purple-800',
  [ROLES.CO_SUPERVISOR]: 'bg-indigo-100 text-indigo-800',
  [ROLES.DEPARTMENT_HEAD]: 'bg-orange-100 text-orange-800',
  [ROLES.DEAN]: 'bg-red-100 text-red-800',
  [ROLES.UNIVERSITY_PRESIDENT]: 'bg-pink-100 text-pink-800',
  [ROLES.SYSTEM_MANAGER]: 'bg-gray-100 text-gray-800',
  [ROLES.EXTERNAL_COMPANY]: 'bg-green-100 text-green-800',
};

// Colors for Notification Types
export const NOTIFICATION_COLORS: Record<string, string> = {
  [NOTIFICATION_TYPES.INVITATION]: 'bg-blue-50 border-blue-200',
  [NOTIFICATION_TYPES.INVITATION_ACCEPTED]: 'bg-green-50 border-green-200',
  [NOTIFICATION_TYPES.INVITATION_REJECTED]: 'bg-red-50 border-red-200',
  [NOTIFICATION_TYPES.APPROVAL_REQUEST]: 'bg-yellow-50 border-yellow-200',
  [NOTIFICATION_TYPES.APPROVAL_APPROVED]: 'bg-green-50 border-green-200',
  [NOTIFICATION_TYPES.APPROVAL_REJECTED]: 'bg-red-50 border-red-200',
  [NOTIFICATION_TYPES.SYSTEM_ALERT]: 'bg-orange-50 border-orange-200',
  [NOTIFICATION_TYPES.SYSTEM_INFO]: 'bg-blue-50 border-blue-200',
  [NOTIFICATION_TYPES.REMINDER]: 'bg-purple-50 border-purple-200',
};