import { create } from "zustand";
import { persistAuthToken } from "../services/api";

/* ==========================
   Types
   ========================== */

// Shape coming from backend (may be partial)
export interface ApiUser {
  id?: number;
  pk?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  permissions?: string[];
  department_id?: number;
  college_id?: number;
  // any other backend fields...
}

// Normalized User used across the app
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  department_id?: number;
  college_id?: number;
}

export interface Notification {
  notification_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  related_group?: any;
  related_project?: any;
  related_user?: any;
}

export interface GroupInvitation {
  invitation_id: number;
  group: any;
  invited_student: User;
  invited_by: User;
  status: string;
  created_at: string;
  expires_at: string;
}

export interface ApprovalRequest {
  approval_id: number;
  approval_type: string;
  group?: any;
  project?: any;
  requested_by: User;
  current_approver: User;
  approval_level: number;
  status: string;
  created_at: string;
}

/* ==========================
   localStorage helpers
   ========================== */

function saveUser(user: User) {
  if (!user || typeof user !== "object") return;
  localStorage.setItem("user", JSON.stringify(user));
}

function loadUser(): User | null {
  const stored = localStorage.getItem("user");
  if (!stored || stored === "undefined" || stored === "null") return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

/* ==========================
   Auth Store
   ========================== */

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /**
   * Accepts either an ApiUser (from backend) or a normalized User.
   * Always pass roles array as the second argument.
   */
  login: (user: ApiUser | User, roles: string[], token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: loadUser(),
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,

  login: (apiOrUser, roles, token) => {
    // Normalize input (accept ApiUser or already-normalized User)
    const normalizedUser: User =
      // if it already looks like a normalized User (has 'name' and 'roles'), use it
      (apiOrUser as User).name && Array.isArray((apiOrUser as User).roles)
        ? (apiOrUser as User)
        : {
            id: (apiOrUser as ApiUser).id || (apiOrUser as ApiUser).pk || 0,
            username: (apiOrUser as ApiUser).username || "",
            email: (apiOrUser as ApiUser).email || "",
            name: `${(apiOrUser as ApiUser).first_name || ""} ${(apiOrUser as ApiUser).last_name || ""}`.trim(),
            roles: roles || [],
            permissions: (apiOrUser as ApiUser).permissions || [],
            department_id: (apiOrUser as ApiUser).department_id,
            college_id: (apiOrUser as ApiUser).college_id,
          };

    // persist token to localStorage and axios defaults
    persistAuthToken(token);
    saveUser(normalizedUser);
    set({ user: normalizedUser, isAuthenticated: true });
  },

  logout: () => {
    persistAuthToken(null);
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    saveUser(user);
    set({ user });
  },

  hasRole: (role: string) => {
    const user = loadUser();
    return user?.roles?.includes(role) ?? false;
  },

  hasPermission: (permission: string) => {
    const user = loadUser();
    return user?.permissions?.includes(permission) ?? false;
  },

  hasAnyRole: (roles: string[]) => {
    const user = loadUser();
    return roles.some((r) => user?.roles?.includes(r)) ?? false;
  },
}));

/* ==========================
   Notifications Store
   ========================== */

interface NotificationsStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  clearNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
    }));
  },

  removeNotification: (id: number) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.notification_id !== id),
    }));
  },

  markAsRead: (id: number) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.notification_id === id);
      if (notification && !notification.is_read) {
        return {
          notifications: state.notifications.map((n) =>
            n.notification_id === id ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return {};
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },

  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    set({ notifications, unreadCount });
  },

  setUnreadCount: (count: number) => set({ unreadCount: count }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

/* ==========================
   Invitations Store
   ========================== */

interface InvitationsStore {
  invitations: GroupInvitation[];
  pendingInvitations: GroupInvitation[];
  isLoading: boolean;
  setInvitations: (invitations: GroupInvitation[]) => void;
  addInvitation: (invitation: GroupInvitation) => void;
  removeInvitation: (id: number) => void;
  updateInvitationStatus: (id: number, status: string) => void;
}

export const useInvitationsStore = create<InvitationsStore>((set) => ({
  invitations: [],
  pendingInvitations: [],
  isLoading: false,

  setInvitations: (invitations: GroupInvitation[]) => {
    const pending = invitations.filter((i) => i.status === "pending");
    set({ invitations, pendingInvitations: pending });
  },

  addInvitation: (invitation: GroupInvitation) => {
    set((state) => ({
      invitations: [invitation, ...state.invitations],
      pendingInvitations:
        invitation.status === "pending" ? [invitation, ...state.pendingInvitations] : state.pendingInvitations,
    }));
  },

  removeInvitation: (id: number) => {
    set((state) => ({
      invitations: state.invitations.filter((i) => i.invitation_id !== id),
      pendingInvitations: state.pendingInvitations.filter((i) => i.invitation_id !== id),
    }));
  },

  updateInvitationStatus: (id: number, status: string) => {
    set((state) => ({
      invitations: state.invitations.map((i) => (i.invitation_id === id ? { ...i, status } : i)),
      pendingInvitations: state.pendingInvitations.filter((i) => i.invitation_id !== id),
    }));
  },
}));

/* ==========================
   Approvals Store
   ========================== */

interface ApprovalsStore {
  approvals: ApprovalRequest[];
  pendingApprovals: ApprovalRequest[];
  isLoading: boolean;
  setApprovals: (approvals: ApprovalRequest[]) => void;
  addApproval: (approval: ApprovalRequest) => void;
  removeApproval: (id: number) => void;
  updateApprovalStatus: (id: number, status: string) => void;
}

export const useApprovalsStore = create<ApprovalsStore>((set) => ({
  approvals: [],
  pendingApprovals: [],
  isLoading: false,

  setApprovals: (approvals: ApprovalRequest[]) => {
    const pending = approvals.filter((a) => a.status === "pending");
    set({ approvals, pendingApprovals: pending });
  },

  addApproval: (approval: ApprovalRequest) => {
    set((state) => ({
      approvals: [approval, ...state.approvals],
      pendingApprovals: approval.status === "pending" ? [approval, ...state.pendingApprovals] : state.pendingApprovals,
    }));
  },

  removeApproval: (id: number) => {
    set((state) => ({
      approvals: state.approvals.filter((a) => a.approval_id !== id),
      pendingApprovals: state.pendingApprovals.filter((a) => a.approval_id !== id),
    }));
  },

  updateApprovalStatus: (id: number, status: string) => {
    set((state) => ({
      approvals: state.approvals.map((a) => (a.approval_id === id ? { ...a, status } : a)),
      pendingApprovals: state.pendingApprovals.filter((a) => a.approval_id !== id),
    }));
  },
}));

