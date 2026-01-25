import React, { useEffect, useState } from 'react';
import { useAuthStore, useInvitationsStore, useApprovalsStore } from '../store/useStore';
import { ROLES } from '../config/api';
import {
  FiUsers,
  FiFileText,
  FiBell,
  FiCheckSquare,
  FiTrendingUp,
} from 'react-icons/fi';
import api from '../services/api';

interface DashboardStats {
  totalGroups: number;
  totalProjects: number;
  pendingApprovals: number;
  pendingInvitations: number;
}

const DashboardPage: React.FC = () => {
  const { user, hasAnyRole } = useAuthStore();
  const { pendingInvitations } = useInvitationsStore();
  const { pendingApprovals } = useApprovalsStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalProjects: 0,
    pendingApprovals: 0,
    pendingInvitations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: number;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6 border-r-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          مرحباً، {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          الدور: <span className="font-semibold">{user?.roles?.[0]?.type}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiUsers}
          label="المجموعات"
          value={stats.totalGroups}
          color="#3b82f6"
        />
        <StatCard
          icon={FiFileText}
          label="المشاريع"
          value={stats.totalProjects}
          color="#8b5cf6"
        />
        {hasAnyRole([ROLES.SUPERVISOR, ROLES.DEPARTMENT_HEAD, ROLES.DEAN, ROLES.UNIVERSITY_PRESIDENT]) && (
          <StatCard
            icon={FiCheckSquare}
            label="الموافقات المعلقة"
            value={pendingApprovals.length}
            color="#f59e0b"
          />
        )}
        {hasAnyRole([ROLES.STUDENT]) && (
          <StatCard
            icon={FiBell}
            label="الدعوات المعلقة"
            value={pendingInvitations.length}
            color="#ef4444"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Invitations */}
        {hasAnyRole([ROLES.STUDENT]) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiBell className="text-red-500" />
              الدعوات الأخيرة
            </h2>
            {pendingInvitations.length > 0 ? (
              <div className="space-y-3">
                {pendingInvitations.slice(0, 3).map((invitation) => (
                  <div
                    key={invitation.invitation_id}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <p className="font-semibold text-gray-900 text-sm">
                      {invitation.group.group_name}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      من: {invitation.invited_by.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">لا توجد دعوات معلقة</p>
            )}
          </div>
        )}

        {/* Recent Approvals */}
        {hasAnyRole([ROLES.SUPERVISOR, ROLES.DEPARTMENT_HEAD, ROLES.DEAN, ROLES.UNIVERSITY_PRESIDENT]) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCheckSquare className="text-yellow-500" />
              الموافقات المعلقة
            </h2>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-3">
                {pendingApprovals.slice(0, 3).map((approval) => (
                  <div
                    key={approval.approval_id}
                    className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <p className="font-semibold text-gray-900 text-sm">
                      {approval.approval_type}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      من: {approval.requested_by.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">لا توجد موافقات معلقة</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
