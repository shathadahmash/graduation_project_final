import React from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiUserPlus, FiUsers } from 'react-icons/fi';

const TeamStatusPage = ({ myGroup, onNavigateToAdd }: any) => {
  // تحويل البيانات لمصفوفة لضمان عمل الـ map حتى لو أرسل الباك إيند كائناً واحداً
  const groupsList = Array.isArray(myGroup) ? myGroup : myGroup ? [myGroup] : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-right">
      <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 justify-end">
        حالة قبول أعضاء الفرق
        <FiUsers className="text-blue-600" />
      </h2>
      
      {groupsList.length === 0 ? (
        <div className="bg-slate-50 p-10 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-bold">لم يتم العثور على أي طلبات إنشاء مجموعات حالياً</p>
          <button 
            onClick={onNavigateToAdd}
            className="mt-4 text-blue-600 font-black flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
          >
            <FiUserPlus /> إرسال أول دعوة
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {groupsList.map((group: any) => (
            <div key={group.id} className="space-y-4">
              {/* ترويسة المجموعة */}
              <div className="flex items-center justify-between bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
                 <span className="text-xs font-bold text-slate-400">رقم الطلب: #{group.id}</span>
                 <h3 className="text-lg font-black text-blue-800">فريق: {group.group_name}</h3>
              </div>

              {/* شبكة الأعضاء */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.approvals?.map((member: any) => {
                  // توحيد فحص الحالة بناءً على الـ Choices في Django
                  console.log("البيانات القادمة من السيرفر للعضو:", member);
                  const isApproved = member.status === 'accepted';
                  const isRejected = member.status === 'rejected';

                  return (
                    <div key={member.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                          isApproved ? 'bg-green-100 text-green-600' : 
                          isRejected ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {isApproved ? <FiCheckCircle /> : isRejected ? <FiXCircle /> : <FiClock />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">
                            {/* استخدام الحقل 'name' الذي أضفناه في الـ Serializer */}
                            {member.user_detail?.name||member.name || "عضو مدعو"}
                          </p>
                          <p className="text-xs text-slate-400 font-bold">
                            {member.role === 'student' ? 'طالب' : 
                             member.role === 'supervisor' ? 'مشرف' : 'أستاذ مساعد'}
                          </p>
                        </div>
                      </div>

                      <div className="text-left flex items-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                          isApproved ? 'bg-green-50 text-green-700' : 
                          isRejected ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {isApproved ? 'تم القبول' : isRejected ? 'مرفوض' : 'قيد الانتظار'}
                        </span>
                        
                        {isRejected && (
                          <button 
                            onClick={onNavigateToAdd}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            title="دعوة بديل"
                          >
                            <FiUserPlus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamStatusPage;