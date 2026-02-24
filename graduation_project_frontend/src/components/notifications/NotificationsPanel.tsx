import React from 'react';
import { useNotificationsStore } from '../../store/useStore';
import { FiX, FiCheck, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { NOTIFICATION_TYPES } from '../../config/api';
import { approvalService } from '../../services/approvalService'; // استيراد خدمة الموافقة

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationsStore();

  if (!isOpen) return null;

  // دالة التعامل مع القبول أو الرفض
  const handleResponse = async (notification: any, status: 'approve' | 'reject') => {
    //related_id هو المعرف من السيريالايزر المعدل
    const approvalId = notification.related_id;

    if (!approvalId) {
      alert("خطأ: لا يوجد معرف لهذا الطلب.");
      return;
    }

    try {
      if (status === 'approve') {
        await approvalService.approveRequest(approvalId);
        alert("تم القبول بنجاح");
      } else {
        await approvalService.rejectRequest(approvalId);
        alert("تم الرفض");
      }
      
      // تحديث حالة الإشعار في الواجهة
      markAsRead(notification.notification_id);
      
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "حدث خطأ أثناء معالجة الرد");
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      [NOTIFICATION_TYPES.INVITATION]: '📧',
      [NOTIFICATION_TYPES.INVITATION_ACCEPTED]: '✅',
      [NOTIFICATION_TYPES.INVITATION_REJECTED]: '❌',
      [NOTIFICATION_TYPES.APPROVAL_REQUEST]: '📋',
      [NOTIFICATION_TYPES.APPROVAL_APPROVED]: '👍',
      [NOTIFICATION_TYPES.APPROVAL_REJECTED]: '👎',
      [NOTIFICATION_TYPES.SYSTEM_ALERT]: '⚠️',
      [NOTIFICATION_TYPES.SYSTEM_INFO]: 'ℹ️',
      [NOTIFICATION_TYPES.REMINDER]: '🔔',
    };
    return icons[type] || '📬';
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">الإشعارات</h3>
            <p className="text-sm text-blue-200">{unreadCount} إشعارات جديدة</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-lg transition">
            <FiX size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        {unreadCount > 0 && (
          <div className="px-4 py-3 border-b border-gray-200 flex gap-2">
            <button
              onClick={markAllAsRead}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
            >
              <FiCheck size={16} /> تحديد الكل كمقروء
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <span className="text-4xl mb-2">📭</span>
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((n) => (
                <div
                  key={n.notification_id}
                  className={`p-4 hover:bg-gray-50 transition rounded-lg mb-1 ${
                    !n.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">{getNotificationIcon(n.notification_type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{n.title}</h4>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{n.message}</p>
                      
                      {/* --- التعديل المحدث لأزرار الموافقة والرفض --- */}
                    {!n.is_read && n.related_id && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // لمنع تداخل الضغطات
                            handleResponse(n, 'approve');
                          }}
                          className="flex-1 bg-blue-600 text-white py-1.5 rounded-md hover:bg-blue-700 transition text-xs font-bold shadow-sm"
                        >
                          موافقة
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResponse(n, 'reject');
                          }}
                          className="flex-1 bg-red-50 text-red-600 py-1.5 rounded-md hover:bg-red-100 transition text-xs font-bold border border-red-100"
                        >
                          رفض
                        </button>
                      </div>
                    )}

                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ar })}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={() => markAsRead(n.notification_id)}
                          className="p-1 hover:bg-blue-100 rounded transition text-blue-600"
                          title="تحديد كمقروء"
                        >
                          <FiCheck size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(n.notification_id)}
                        className="p-1 hover:bg-red-100 rounded transition text-red-600"
                        title="حذف"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;