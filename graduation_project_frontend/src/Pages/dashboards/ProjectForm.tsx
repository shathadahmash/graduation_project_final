import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiInfo } from 'react-icons/fi';
import { projectService } from '../../services/projectService';
import { groupService } from '../../services/groupService';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/useStore';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: number) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
  showAllGroups?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSuccess, initialData, mode, showAllGroups }) => {
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PrivateCompany');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [tools, setTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState('');
  const [createdBy, setCreatedBy] = useState<any>('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [state, setState] = useState('Active');
  const [groupId, setGroupId] = useState('');

  const [colleges, setColleges] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOptions();
      if (initialData && mode === 'edit') {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setType(initialData.type || 'PrivateCompany');
        setStartDate(initialData.start_date != null ? String(initialData.start_date) : '');
        setEndDate(initialData.end_date != null ? String(initialData.end_date) : '');
        setFieldValue(initialData.field || '');
        // normalize tools which may be array or CSV string
        const t = initialData.tools ?? [];
        setTools(Array.isArray(t) ? t : (typeof t === 'string' && t.length ? t.split(',').map((s: string) => s.trim()) : []));
        setCreatedBy(initialData.created_by?.id || initialData.created_by || '');
        setCollege(initialData.college || '');
        setYear(initialData.year || initialData.start_year || '');
        setState(initialData.state || 'Active');
        setGroupId(initialData.group_id || initialData.group || '');
      } else {
        // Reset for create
        setTitle('');
        setDescription('');
        setType('PrivateCompany');
        setStartDate(String(new Date().getFullYear()));
        setEndDate('');
        setFieldValue('');
        setTools([]);
        setToolInput('');
        setCreatedBy('');
        setCollege(user?.college_id || '');
        setYear(new Date().getFullYear().toString());
        setState('Active');
        setGroupId('');
      }
    }
  }, [isOpen, initialData, mode, user]);

  const loadOptions = async () => {
    try {
      const [filterOpts, groupsData] = await Promise.all([
        projectService.getFilterOptions(),
        // fetch full group rows (bulk-aware) when available
        (groupService.getGroupsFields ? groupService.getGroupsFields() : groupService.getGroups())
      ]);
      setColleges(filterOpts.colleges || []);
      // If caller requested all groups, show them; otherwise filter groups that don't have a project
      let available = groupsData || [];
      if (!showAllGroups) {
        available = available.filter((g: any) => !g.project || (mode === 'edit' && initialData?.group_id == g.group_id));
      }
      setAvailableGroups(available);
      try {
        const users = await userService.getAllUsers();
        setAllUsers(users || []);
      } catch (e) {
        console.warn('Failed to load users for ProjectForm', e);
      }
    } catch (err) {
      console.error('Failed to load options:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('يرجى إدخال عنوان المشروع');
    if (!description.trim()) return setError('يرجى إدخال وصف المشروع');
    if (!startDate) return setError('يرجى تحديد تاريخ البدء');

    // validate years are integers
    const startYear = parseInt(String(startDate), 10);
    if (Number.isNaN(startYear) || startYear < 1900 || startYear > 3000) return setError('يرجى إدخال سنة بداية صالحة');
    let endYear: number | null = null;
    if (endDate && String(endDate).trim().length) {
      const e = parseInt(String(endDate), 10);
      if (Number.isNaN(e) || e < 1900 || e > 3000) return setError('يرجى إدخال سنة انتهاء صالحة');
      endYear = e;
    }

    // if the user typed a tool but didn't press Enter, include it
    const finalTools = toolInput && toolInput.trim()
      ? Array.from(new Set([...(Array.isArray(tools) ? tools : []), toolInput.trim()]))
      : (Array.isArray(tools) ? tools : []);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      start_date: startYear,
      end_date: endYear,
      field: fieldValue || null,
      // backend expects text; convert tools array to CSV string
      tools: finalTools.length ? finalTools.join(', ') : null,
      created_by: createdBy || undefined,
      college,
      year,
      state,
    };

    try {
      setLoading(true);
      let result: any;
      if (mode === 'edit' && initialData) {
        result = await projectService.updateProject(initialData.project_id, payload);
      } else {
        result = await projectService.proposeProject(payload);
      }

      const projectId = result?.project_id || result?.id;

      // Handle group assignment changes for edit mode
      if (mode === 'edit' && initialData?.group_id != groupId) {
        // If changing group, unlink from old group
        if (initialData.group_id) {
          try {
            await groupService.linkProjectToGroup(Number(initialData.group_id), null as any);
          } catch (unlinkErr) {
            console.error('Failed to unlink project from old group:', unlinkErr);
          }
        }
        // Link to new group if selected
        if (groupId) {
          try {
            await groupService.linkProjectToGroup(Number(groupId), projectId);
          } catch (linkErr) {
            console.error('Failed to link project to new group:', linkErr);
            setError('تم تحديث المشروع بنجاح لكن فشل في ربطه بالمجموعة الجديدة');
          }
        }
      } else if (groupId && projectId) {
        // For create mode or if group was selected
        try {
          await groupService.linkProjectToGroup(Number(groupId), projectId);
        } catch (linkErr) {
          console.error('Failed to link project to group:', linkErr);
          setError('تم إنشاء المشروع بنجاح لكن فشل في ربطه بالمجموعة');
        }
      }

      // notify other parts of the app to refresh data (DeanDashboard listens)
      try {
        window.dispatchEvent(new CustomEvent('projects:changed', { detail: { projectId } }));
      } catch (e) { /* ignore */ }

      onSuccess(projectId);
      onClose();
      // clear the local input now that we've saved and sync tools state
      setToolInput('');
      setTools(finalTools);
      alert(mode === 'edit' ? 'تم تحديث المشروع بنجاح.' : 'تم إنشاء المشروع بنجاح!');
    } catch (err: any) {
      const serverData = err.response?.data;
      if (serverData && typeof serverData === 'object') {
        const errorMsg = Object.entries(serverData)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ');
        setError(errorMsg);
      } else {
        setError('فشل في حفظ المشروع');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* remove heavy backdrop to avoid hazy overlay over tables; keep transparent click-catcher */}
      <div className="fixed inset-0 bg-transparent z-[70]" onClick={onClose} />

      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
          
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {mode === 'edit' ? 'تعديل المشروع' : 'إنشاء مشروع جديد'}
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest italic">
                أدخل تفاصيل المشروع
              </p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all !text-slate-400">
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <FiInfo className="text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">عنوان المشروع *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل عنوان المشروع"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">نوع المشروع</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PrivateCompany">شركة خاصة</option>
                  <option value="Government">حكومي</option>
                  <option value="NGO">منظمة غير حكومية</option>
                  <option value="StudentProposed">مقترح من طالب</option>
                  <option value="Academic">أكاديمي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">سنة البدء *</label>
                <input
                  type="number"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min={1900}
                  max={3000}
                  step={1}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">سنة الانتهاء</label>
                <input
                  type="number"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  min={1900}
                  max={3000}
                  step={1}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">التخصص / المجال</label>
                <input
                  type="text"
                  value={fieldValue}
                  onChange={e => setFieldValue(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: تعلم الآلة"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">الأدوات (اضغط Enter للإضافة)</label>
                <div className="flex gap-2 flex-wrap items-center">
                  {tools.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700 flex items-center gap-2">
                      {t}
                      <button type="button" onClick={() => setTools(ts => ts.filter((x, i) => i !== idx))} className="text-rose-500 px-1">×</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={toolInput}
                  onChange={e => setToolInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = toolInput.trim();
                      if (v) {
                        setTools(ts => Array.from(new Set([...ts, v])));
                        setToolInput('');
                      }
                    }
                  }}
                  placeholder="أدخل أداة ثم اضغط Enter"
                  className="w-full mt-2 p-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">تم الإنشاء بواسطة</label>
                <select
                  value={createdBy}
                  onChange={e => setCreatedBy(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">- اختر مستخدم -</option>
                  {allUsers.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">الكلية</label>
                <input
                  type="text"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  list="colleges-list"
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اختر أو أدخل اسم الكلية"
                />
                <datalist id="colleges-list">
                  {colleges.map((c: any) => (
                    <option key={c.id} value={c.name_ar || c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">السنة الأكاديمية</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">الحالة</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">نشط</option>
                  <option value="Inactive">غير نشط</option>
                  <option value="Completed">مكتمل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">تعيين إلى مجموعة (اختياري)</label>
                <select
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">لا تعيين</option>
                  {availableGroups.map((g: any) => (
                    <option key={g.group_id} value={g.group_id}>
                      {g.group_name} - {g.department?.name || ''} ({g.academic_year})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">وصف المشروع *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                placeholder="اكتب وصفاً مفصلاً للمشروع..."
                required
              />
            </div>
            {initialData?.users && initialData.users.length > 0 && (
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">المستخدمون في المجموعة</label>
                <div className="flex gap-2 flex-wrap">
                  {initialData.users.map((u: any, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700">{u.displayName || u.name}</span>
                  ))}
                </div>
              </div>
            )}
          </form>

          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-lg
                ${loading 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:scale-105 active:scale-95'}`}
            >
              {loading ? 'جاري الحفظ...' : (
                <>حفظ المشروع <FiSave size={18}/></>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectForm;