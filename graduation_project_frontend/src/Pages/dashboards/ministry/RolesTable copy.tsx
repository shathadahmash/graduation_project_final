import React, { useEffect, useState, useMemo } from 'react';
import { userService, Role } from '../services/userService';
import { exportToCSV } from './tableUtils';
import { containerClass, tableWrapperClass, tableClass, theadClass } from './tableStyles';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiShield, 
  FiCheck, 
  FiX, 
  FiSearch, 
  FiActivity,
  FiInfo
} from 'react-icons/fi';

const RolesTable: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filtered roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => 
      role.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.id.toString().includes(searchTerm)
    );
  }, [roles, searchTerm]);

  // Create new role
  const handleCreate = async () => {
    const name = newRoleName.trim();
    if (!name) {
      setMessage({ type: 'error', text: 'الرجاء إدخال اسم الدور' });
      return;
    }
    if (roles.some(r => r.type.toLowerCase() === name.toLowerCase())) {
      setMessage({ type: 'error', text: 'هذا الدور موجود بالفعل في النظام' });
      return;
    }
    setIsCreating(true);
    try {
      await userService.createRole(name);
      setNewRoleName('');
      setMessage({ type: 'success', text: 'تم إنشاء الدور الجديد بنجاح' });
      await fetchRoles();
    } catch (err: any) {
      console.error('Failed to create role', err);
      const errMsg = err?.response?.data?.type || err?.response?.data?.detail || 'فشل إنشاء الدور';
      setMessage({ type: 'error', text: String(errMsg) });
    } finally {
      setIsCreating(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Update role
  const handleUpdate = async () => {
    if (!editingRole || !editingName.trim()) return;
    try {
      await userService.updateRole(editingRole.id, { type: editingName });
      setEditingRole(null);
      setEditingName('');
      setMessage({ type: 'success', text: 'تم تحديث بيانات الدور بنجاح' });
      fetchRoles();
    } catch (err) {
      console.error('Failed to update role', err);
      setMessage({ type: 'error', text: 'فشل تحديث الدور' });
    } finally {
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Delete role
  const handleDelete = async (roleId: number) => {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا الدور؟ قد يؤثر ذلك على المستخدمين المرتبطين به.')) return;
    try {
      await userService.deleteRole(roleId);
      setMessage({ type: 'success', text: 'تم حذف الدور بنجاح' });
      fetchRoles();
    } catch (err) {
      console.error('Failed to delete role', err);
      setMessage({ type: 'error', text: 'فشل حذف الدور' });
    } finally {
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className={containerClass} dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">إدارة الأدوار</h1>
          <p className="text-slate-500 mt-1">تحديد وتعديل صلاحيات وأدوار المستخدمين في النظام</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث عن دور..."
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-sm shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => exportToCSV('roles.csv', filteredRoles)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600">تصدير</button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-blue-600'
        }`}>
          {message.type === 'success' ? <FiCheck className="shrink-0" /> : <FiX className="shrink-0" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Role Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-blue-100 sticky top-24">
            <div className="w-14 h-14 bg-blue-600 text-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <FiShield size={28} />
            </div>
            <h3 className="text-xl font-black text-blue-800 mb-2">إضافة دور جديد</h3>
            <p className="text-blue-400 text-sm mb-6 leading-relaxed">
              قم بإدخال اسم الدور الجديد لإضافته إلى قائمة الأدوار المتاحة في النظام.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-blue-400 uppercase mr-1">اسم الدور</label>
                <input
                  type="text"
                  placeholder="مثال: مدير، مشرف، طالب..."
                  className="w-full border border-blue-600 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-blue-600 transition-all"
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={isCreating || !newRoleName.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3.5 rounded-xl font-black transition-all  flex items-center justify-center gap-2 disabled:opacity-100 disabled:shadow-none"
              >
                {isCreating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiPlus />
                    <span>إضافة الدور</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <FiInfo className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-500 leading-relaxed">
                تأكد من اختيار أسماء أدوار واضحة ومميزة لتسهيل عملية إدارة الصلاحيات لاحقاً.
              </p>
            </div>
          </div>
        </div>

        {/* Roles Table Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] shadow-sm border border-blue-100 overflow-hidden">
            <div className={tableWrapperClass}>
              <table className={tableClass + ' text-right'}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black text-blue-50 uppercase tracking-wider">المعرف (ID)</th>
                    <th className="px-8 py-5 text-xs font-black text-blue-50 uppercase tracking-wider">اسم الدور</th>
                    <th className="px-8 py-5 text-xs font-black text-blue-50 uppercase tracking-wider text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="font-bold">جاري تحميل الأدوار...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRoles.length > 0 ? (
                    filteredRoles.map(role => (
                      <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold text-slate-400">#{role.id}</span>
                        </td>
                        <td className="px-8 py-6">
                          {editingRole?.id === role.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                              <input
                                type="text"
                                value={editingName}
                                onChange={e => setEditingName(e.target.value)}
                                className="border-2 border-pink-500 rounded-xl px-4 py-2 w-full outline-none shadow-sm"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-black text-xs">
                                {role.type[0].toUpperCase()}
                              </div>
                              <span className="text-sm font-black text-slate-800">{role.type}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center gap-2">
                            {editingRole?.id === role.id ? (
                              <>
                                <button
                                  onClick={handleUpdate}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-all shadow-md shadow-emerald-100"
                                  title="حفظ"
                                >
                                  <FiCheck size={18} />
                                </button>
                                <button
                                  onClick={() => setEditingRole(null)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-2.5 rounded-xl transition-all"
                                  title="إلغاء"
                                >
                                  <FiX size={18} />
                                </button>
                              </>
                            ) : (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => {
                                    setEditingRole(role);
                                    setEditingName(role.type);
                                  }}
                                  className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                  title="تعديل"
                                >
                                  <FiEdit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(role.id)}
                                  className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                  title="حذف"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <FiActivity size={48} className="opacity-20" />
                          <p className="font-bold">لا توجد أدوار تطابق بحثك</p>
                          <button onClick={() => setSearchTerm('')} className="text-pink-600 text-sm underline">عرض الكل</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer Info */}
            {!loading && filteredRoles.length > 0 && (
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  إجمالي الأدوار: {filteredRoles.length}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></div>
                  <span className="text-[10px] text-slate-400 font-black uppercase">النظام نشط</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesTable;