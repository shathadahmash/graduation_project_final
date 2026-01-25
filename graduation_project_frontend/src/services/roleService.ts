// src/services/roleService.ts
import api from './api';

export interface Role {
  role_ID: number;
  type: string;
  role_type?: string | null;
}

export interface Permission {
  perm_ID: number;
  name: string;
  Description?: string | null;
}

export interface RolePermission {
  role: number;       // role_ID
  permission: number; // perm_ID
}

export interface UserRole {
  user: number;  // user ID
  role: number;  // role_ID
}

export const roleService = {
  // --- Roles ---
  async getAllRoles(): Promise<Role[]> {
    const res = await api.get('/roles/');
    return res.data;
  },

  async getRoleById(roleId: number): Promise<Role> {
    const res = await api.get(`/roles/${roleId}/`);
    return res.data;
  },

  async createRole(data: Partial<Role>): Promise<Role> {
    const res = await api.post('/roles/', data);
    return res.data;
  },

  async updateRole(roleId: number, data: Partial<Role>): Promise<Role> {
    const res = await api.put(`/roles/${roleId}/`, data);
    return res.data;
  },

  async deleteRole(roleId: number): Promise<void> {
    await api.delete(`/roles/${roleId}/`);
  },

  // --- Permissions ---
  async getAllPermissions(): Promise<Permission[]> {
    const res = await api.get('/permissions/');
    return res.data;
  },

  async getPermissionById(permissionId: number): Promise<Permission> {
    const res = await api.get(`/permissions/${permissionId}/`);
    return res.data;
  },

  async createPermission(data: Partial<Permission>): Promise<Permission> {
    const res = await api.post('/permissions/', data);
    return res.data;
  },

  async updatePermission(permissionId: number, data: Partial<Permission>): Promise<Permission> {
    const res = await api.put(`/permissions/${permissionId}/`, data);
    return res.data;
  },

  async deletePermission(permissionId: number): Promise<void> {
    await api.delete(`/permissions/${permissionId}/`);
  },

  // --- RolePermissions ---
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const res = await api.get(`/roles/${roleId}/permissions/`);
    return res.data;
  },

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    await api.post('/role-permissions/', { role: roleId, permission: permissionId });
  },

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await api.delete(`/role-permissions/?role=${roleId}&permission=${permissionId}`);
  },

  // --- UserRoles ---
  async getUserRoles(userId: number): Promise<Role[]> {
    const res = await api.get(`/users/${userId}/roles/`);
    return res.data;
  },

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    // send both field names for compatibility
    await api.post('/user-roles/', { user: userId, role: roleId, user_id: userId, role_id: roleId });
  },

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await api.delete(`/user-roles/?user=${userId}&role=${roleId}`);
  },
};
