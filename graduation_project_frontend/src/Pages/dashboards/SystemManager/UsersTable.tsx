import React, { useEffect, useState, useMemo } from "react";
import { userService, User, Role } from "../../../services/userService";
import { exportToCSV } from '../../../components/tableUtils';
import { containerClass, tableWrapperClass, tableClass, theadClass } from '../../../components/tableStyles';
import { 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiX, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiBriefcase, 
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from "react-icons/fi";

interface NewUser {
  username: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  roleId?: number;
}

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    company_name: "",
    first_name: "",
    last_name: "",
    roleId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<(User & { roleId?: number }) | null>(null);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // Active/Inactive

  // Pagination state
  const [visibleRows, setVisibleRows] = useState(10);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const allRoles = await userService.getAllRoles();
      setRoles(allRoles);
    } catch (err) {
      console.error("❌ Error fetching roles:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  // Filtered users logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.company_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === "" || user.roles?.some(r => r.type === filterRole);
      const matchesGender = filterGender === "" || user.gender === filterGender;
      const matchesStatus = filterStatus === "" || 
        (filterStatus === "Active" ? user.is_active : !user.is_active);

      return matchesSearch && matchesRole && matchesGender && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterGender, filterStatus]);

  // Paginated users
  const paginatedUsers = filteredUsers.slice(0, visibleRows);

  const handleCreateUser = async () => {
    const { username, name, email, password, roleId } = newUser;
    if (!username || !email || !password) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...newUser,
        phone: newUser.phone || null,
        gender: newUser.gender || null,
        company_name: newUser.company_name || null,
      };

      const createdUser = await userService.createUser(payload as any);
      if (roleId) {
        await userService.assignRoleToUser(createdUser.id, roleId);
      }

      setNewUser({ 
        username: "", name: "", email: "", password: "", 
        phone: "", gender: "", company_name: "", 
        first_name: "", last_name: "", roleId: undefined 
      });
      setShowCreateForm(false);
      fetchUsers();
    } catch (err: any) {
      console.error("❌ Error creating user:", err);
      alert(`Failed to create user: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      setLoading(true);
      const updatedData = {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone || null,
        gender: editingUser.gender || null,
        company_name: editingUser.company_name || null,
        is_active: editingUser.is_active,
      };
      
      await userService.updateUser(editingUser.id, updatedData);

      const currentRoleId = editingUser.roles?.[0]?.id;
      const newRoleId = editingUser.roleId;

      if (newRoleId && newRoleId !== currentRoleId) {
        if (currentRoleId) {
          await userService.removeRoleFromUser(editingUser.id, currentRoleId);
        }
        await userService.assignRoleToUser(editingUser.id, newRoleId);
      }

      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error("❌ Error updating user:", err);
      alert(`Failed to update user: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error(`❌ Error deleting user ${userId}:`, err);
    }
  };

  const startEditing = (user: User) => {
    setShowCreateForm(false);
    setEditingUser({
      ...user,
      roleId: user.roles?.[0]?.id,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterRole("");
    setFilterGender("");
    setFilterStatus("");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={containerClass}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">إدارة المستخدمين</h1>
          <p className="text-slate-500 mt-1">عرض وتعديل بيانات المستخدمين في النظام</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => exportToCSV('users.csv', filteredUsers)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">تصدير</button>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowCreateForm(!showCreateForm);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-blue-700 transition-all font-bold flex items-center gap-2"
          >
            {showCreateForm ? <FiX /> : <FiUser />}
            {showCreateForm ? "إلغاء" : "إضافة مستخدم جديد"}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-1">
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">بحث شامل</label>
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="الاسم، البريد، الشركة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">الدور الوظيفي</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm cursor-pointer appearance-none"
            >
              <option value="">جميع الأدوار</option>
              {roles.map((role) => (
                <option key={role.id} value={role.type}>{role.type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">الجنس</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm cursor-pointer appearance-none"
            >
              <option value="">الكل</option>
              <option value="Male">ذكر</option>
              <option value="Female">أنثى</option>
              <option value="Other">أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm cursor-pointer appearance-none"
            >
              <option value="">الكل</option>
              <option value="Active">نشط</option>
              <option value="Inactive">غير نشط</option>
            </select>
          </div>
        </div>
        
        {(searchTerm || filterRole || filterGender || filterStatus) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
            >
              <FiX /> مسح جميع الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingUser) && (
        <div className="mb-8 p-8 bg-white rounded-2xl shadow-xl border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-2">
            {editingUser ? <FiBriefcase className="text-yellow-500" /> : <FiUser className="text-indigo-500" />}
            {editingUser ? "تحديث بيانات المستخدم" : "إنشاء حساب مستخدم جديد"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!editingUser && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 mr-1">اسم المستخدم *</label>
                <input type="text" placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-1">الاسم الكامل</label>
              <input type="text" placeholder="Full Name" value={editingUser ? editingUser.name || "" : newUser.name} onChange={e => editingUser ? setEditingUser({...editingUser, name: e.target.value}) : setNewUser({ ...newUser, name: e.target.value })} className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-1">البريد الإلكتروني *</label>
              <input type="email" placeholder="Email" value={editingUser ? editingUser.email || "" : newUser.email} onChange={e => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({ ...newUser, email: e.target.value })} className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" />
            </div>
            {!editingUser && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 mr-1">كلمة المرور *</label>
                <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-1">رقم الهاتف</label>
              <input type="text" placeholder="Phone" value={editingUser ? editingUser.phone || "" : newUser.phone} onChange={e => editingUser ? setEditingUser({...editingUser, phone: e.target.value}) : setNewUser({ ...newUser, phone: e.target.value })} className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-1">اسم الشركة</label>
              <input type="text" placeholder="Company Name" value={editingUser ? editingUser.company_name || "" : newUser.company_name} onChange={e => editingUser ? setEditingUser({...editingUser, company_name: e.target.value}) : setNewUser({ ...newUser, company_name: e.target.value })} className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-1">الجنس</label>
              <select value={editingUser ? editingUser.gender || "" : newUser.gender} onChange={e => editingUser ? setEditingUser({...editingUser, gender: e.target.value}) : setNewUser({ ...newUser, gender: e.target.value })} className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50">
                <option value="">اختر الجنس</option>
                <option value="Male">ذكر</option>
                <option value="Female">أنثى</option>
                <option value="Other">أخرى</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-1">الدور</label>
              <select 
                value={editingUser ? editingUser.roleId || "" : newUser.roleId || ""} 
                onChange={e => editingUser ? setEditingUser({...editingUser, roleId: Number(e.target.value)}) : setNewUser({ ...newUser, roleId: Number(e.target.value) })} 
                className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              >
                <option value="">اختر الدور</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.type}</option>
                ))}
              </select>
            </div>
            {editingUser && (
              <div className="flex items-center gap-2 pt-6">
                <input 
                  type="checkbox" 
                  id="is_active" 
                  checked={editingUser.is_active} 
                  onChange={e => setEditingUser({...editingUser, is_active: e.target.checked})}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-slate-700">حساب نشط</label>
              </div>
            )}
            <div className="lg:col-span-3 flex gap-3 mt-4">
              <button 
                onClick={editingUser ? handleUpdateUser : handleCreateUser} 
                className={`flex-1 ${editingUser ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-6 py-3 rounded-xl font-black transition-all shadow-lg disabled:opacity-50`} 
                disabled={loading}
              >
                {loading ? "جاري المعالجة..." : (editingUser ? "تحديث البيانات" : "إنشاء الحساب")}
              </button>
              <button 
                onClick={() => { setShowCreateForm(false); setEditingUser(null); }} 
                className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-600"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className={tableWrapperClass}>
          <table className={tableClass + ' text-right'}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">المستخدم</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">معلومات التواصل</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">الشركة / الدور</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">تاريخ الانضمام</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                          {(user.name || user.username || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">{user.name || "بدون اسم"}</span>
                          <span className="text-xs text-slate-400">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <FiMail className="text-slate-300" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <FiPhone className="text-slate-300" />
                          {user.phone || "لا يوجد هاتف"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <FiBriefcase className="text-slate-300" />
                          {user.company_name || "جهة غير محددة"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            user.roles?.[0]?.type === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.roles?.[0]?.type || "بدون دور"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                        user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {user.is_active ? <FiCheckCircle /> : <FiXCircle />}
                        {user.is_active ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FiCalendar className="text-slate-300" />
                        {formatDate(user.date_joined)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditing(user)} 
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          تعديل
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)} 
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FiSearch size={40} className="opacity-20" />
                      <p className="font-bold">لم يتم العثور على مستخدمين يطابقون البحث</p>
                      <button onClick={clearFilters} className="text-indigo-600 text-sm underline">إعادة ضبط الفلاتر</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination / Show More */}
        {filteredUsers.length > visibleRows && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col items-center gap-4">
            <button
              onClick={() => setVisibleRows(prev => prev + 10)}
              className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <FiChevronDown /> عرض المزيد ({filteredUsers.length - visibleRows} متبقي)
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              يتم عرض {paginatedUsers.length} من أصل {filteredUsers.length} مستخدم
            </p>
          </div>
        )}
        
        {visibleRows > 10 && (
          <div className="p-4 flex justify-center">
            <button
              onClick={() => setVisibleRows(10)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold underline"
            >
              عرض أقل
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-6 text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-[10px] font-black uppercase">نظام إدارة المستخدمين v2.0</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <FiClock className="text-xs" />
          <span className="text-[10px] font-black uppercase">آخر تحديث: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;