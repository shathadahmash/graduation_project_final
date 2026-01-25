export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },

  // Groups
  GROUPS: {
    LIST: '/groups',
    CREATE: '/groups',
    DETAIL: (id: number) => `/groups/${id}`,
    UPDATE: (id: number) => `/groups/${id}`,
    DELETE: (id: number) => `/groups/${id}`,
    MEMBERS: (id: number) => `/groups/${id}/members`,
    SUPERVISORS: (id: number) => `/groups/${id}/supervisors`,
  },

  // Users
  USERS: {
    LIST: '/users',
    DETAIL: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },

  // Invitations
  INVITATIONS: {
    LIST: '/invitations',
    CREATE: '/invitations',
    DETAIL: (id: number) => `/invitations/${id}`,
    ACCEPT: (id: number) => `/invitations/${id}/accept`,
    REJECT: (id: number) => `/invitations/${id}/reject`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAIL: (id: number) => `/notifications/${id}`,
    MARK_READ: (id: number) => `/notifications/${id}/mark-read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: number) => `/notifications/${id}`,
    UNREAD_COUNT: '/notifications/unread-count',
  },

  // Approvals
  APPROVALS: {
    LIST: '/approvals',
    DETAIL: (id: number) => `/approvals/${id}`,
    APPROVE: (id: number) => `/approvals/${id}/approve`,
    REJECT: (id: number) => `/approvals/${id}/reject`,
  },

  // Projects
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    DETAIL: (id: number) => `/projects/${id}`,
    UPDATE: (id: number) => `/projects/${id}`,
    DELETE: (id: number) => `/projects/${id}`,
  },

  // Colleges
  COLLEGES: {
    LIST: '/colleges',
    DETAIL: (id: number) => `/colleges/${id}`,
    CREATE: '/colleges',
    UPDATE: (id: number) => `/colleges/${id}`,
    DELETE: (id: number) => `/colleges/${id}`,
  },

  // Universities
  UNIVERSITIES: {
    LIST: '/universities',
    DETAIL: (id: number) => `/universities/${id}`,
    CREATE: '/universities',
    UPDATE: (id: number) => `/universities/${id}`,
    DELETE: (id: number) => `/universities/${id}`,
  },

  // Programs
  PROGRAMS: {
    LIST: '/programs',
    DETAIL: (id: number) => `/programs/${id}`,
    CREATE: '/programs',
    UPDATE: (id: number) => `/programs/${id}`,
    DELETE: (id: number) => `/programs/${id}`,
  },

  // Departments
  DEPARTMENTS: {
    LIST: '/departments',
    DETAIL: (id: number) => `/departments/${id}`,
    CREATE: '/departments',
    UPDATE: (id: number) => `/departments/${id}`,
    DELETE: (id: number) => `/departments/${id}`,
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
