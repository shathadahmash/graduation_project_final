import React from "react";
import { useNotificationsStore } from "../../../store/useStore";
import { approvalService } from "../../../services/approvalService";

const SupervisorNotificationsView: React.FC = () => {
  const { notifications, markAsRead } = useNotificationsStore();

  const handleResponse = async (notification: any, status: "approve" | "reject") => {
    const approvalId = notification.related_id; // ✅ use related_id like student panel

    if (!approvalId) {
      alert("خطأ: لا يوجد معرف لهذا الطلب.");
      return;
    }

    try {
      if (status === "approve") {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-1">الإشعارات</h3>
        <p className="text-slate-400 text-sm font-medium">آخر التنبيهات الخاصة بك.</p>
      </div>

      {/* Notifications list */}
      {notifications?.length ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.notification_id}
              className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-slate-800">{n.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  <p className="text-[11px] text-slate-400 mt-3">
                    {new Date(n.created_at).toLocaleString("ar-SA")}
                  </p>

                  {/* Accept / Reject buttons */}
                  {!n.is_read && n.related_id && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleResponse(n, "approve")}
                        className="flex-1 bg-green-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        قبول
                      </button>
                      <button
                        onClick={() => handleResponse(n, "reject")}
                        className="flex-1 bg-red-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        رفض
                      </button>
                    </div>
                  )}
                </div>

                {!n.is_read && (
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    جديد
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-16 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 font-bold">لا توجد إشعارات حالياً</p>
        </div>
      )}
    </div>
  );
};

export default SupervisorNotificationsView;