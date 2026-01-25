import React, { useMemo } from 'react';
import { useApprovalsStore } from '../../../store/useStore';

interface Approval {
  approval_id: number | string;
  approval_type: string;
  requested_by: { name: string } | string;
  created_at: string;
}

const ApprovalRow: React.FC<{ approval: Approval; onAction: (id: number | string, action: 'approve' | 'reject') => void }> = ({ approval, onAction }) => (
  <div className="bg-white/3 p-4 rounded-xl flex flex-col md:flex-row md:justify-between gap-4 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
    <div className="text-right">
      <div className="font-bold text-lg">{approval.approval_type}</div>
      <div className="text-sm text-slate-300 mt-1">من: {typeof approval.requested_by === 'string' ? approval.requested_by : approval.requested_by?.name}</div>
      <div className="text-xs text-slate-400 mt-1">تاريخ الطلب: {new Date(approval.created_at).toLocaleDateString('ar-EG')}</div>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={() => onAction(approval.approval_id, 'approve')} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700">موافقة</button>
      <button onClick={() => onAction(approval.approval_id, 'reject')} className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700">رفض</button>
    </div>
  </div>
);

const ApprovalsPanel: React.FC = () => {
  const { pendingApprovals, approveApproval, rejectApproval } = useApprovalsStore() as any;

  const handleAction = async (id: number | string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve' && approveApproval) await approveApproval(id);
      if (action === 'reject' && rejectApproval) await rejectApproval(id);
    } catch (e) {
      console.error(e);
    }
  };

  const pending = pendingApprovals ?? [];

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">مركز الموافقات</h3>
          <p className="text-sm text-slate-400">الطلبات الموجودة في الطابور وتحتاج قرارك.</p>
        </div>
      </div>

      <div className="space-y-3">
        {pending.length > 0 ? (
          pending.map((approval: Approval) => <ApprovalRow key={approval.approval_id} approval={approval} onAction={handleAction} />)
        ) : (
          <div className="text-center text-slate-400 py-8">لا توجد موافقات معلقة</div>
        )}
      </div>
    </section>
  );
};

export default ApprovalsPanel;
