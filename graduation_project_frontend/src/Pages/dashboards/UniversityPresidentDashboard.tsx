import React, { useState } from 'react';
import { useAuthStore, useApprovalsStore } from '../../store/useStore';
import Layout from '../../components/Layout';

const UniversityPresidentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { pendingApprovals, approvals } = useApprovalsStore();
  const [activeTab, setActiveTab] = useState('home');

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">مرحباً، أ.د {user?.name}</h1>
          <p className="text-sm text-slate-400 mt-1">مسؤوليات: اعتماد سياسات الجامعة، الموافقات العليا، متابعة الأداء الأكاديمي والتقارير الجامعية</p>
        </div>

        {/* بطاقات إحصائية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 theme-card">
            <p className="text-sm text-slate-600">موافقات معلقة</p>
            <p className="text-3xl font-bold text-slate-800">{pendingApprovals.length}</p>
          </div>
          <div className="p-6 theme-card">
            <p className="text-sm text-slate-600">الجامعات</p>
            <p className="text-3xl font-bold text-slate-800">1</p>
          </div>
          <div className="p-6 theme-card">
            <p className="text-sm text-slate-600">الكليات</p>
            <p className="text-3xl font-bold text-slate-800">8</p>
          </div>
          <div className="p-6 theme-card">
            <p className="text-sm text-slate-600">المشاريع</p>
            <p className="text-3xl font-bold text-slate-800">156</p>
          </div>
        </div>

        {/* التبويبات */}
        <div className="border-b border-gray-200 flex gap-8">
          <button onClick={() => setActiveTab('home')} className={`pb-4 font-semibold ${activeTab === 'home' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>
            الرئيسية
          </button>
          <button onClick={() => setActiveTab('approvals')} className={`pb-4 font-semibold ${activeTab === 'approvals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>
            الموافقات ({pendingApprovals.length})
          </button>
          <button onClick={() => setActiveTab('supervisors')} className={`pb-4 font-semibold ${activeTab === 'supervisors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>
            المشرفون
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div className="mt-6">
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((approval) => (
                  <div key={approval.approval_id} className="p-6 theme-card">
                    <p className="font-bold text-slate-800">{approval.approval_type}</p>
                    <p className="text-sm text-slate-600 mt-1">من: {approval.requested_by.name}</p>
                    <div className="flex gap-2 mt-4">
                      <button className="btn-blue">موافقة</button>
                      <button className="btn-outline-blue">رفض</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 py-8">لا توجد موافقات معلقة</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UniversityPresidentDashboard;
