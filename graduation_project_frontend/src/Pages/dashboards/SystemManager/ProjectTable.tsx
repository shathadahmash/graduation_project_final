import React, { useEffect, useState, useMemo } from 'react';
import { projectService, Project } from '../../../services/projectService';
import { exportToCSV } from '../../../components/tableUtils';

const ProjectsTable: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchStates();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Use the projectService.getProjects() which already handles mapping via mapBackendProject
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
    } catch (e) {
      console.error('Failed to fetch projects', e);
      alert('فشل تحميل المشاريع');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const data = await projectService.getFilterOptions();
      // Extract states from filter options if available
      if (data?.states) {
        setStates(data.states);
      }
    } catch (e) {
      console.error('Failed to fetch states', e);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.project_id !== id));
      alert('تم حذف المشروع بنجاح');
    } catch (e) {
      console.error(e);
      alert('فشل الحذف');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject({ ...project });
    setIsCreatingNew(false);
    setShowModal(true);
  };

  const handleCreate = () => {
    // Initialize with required fields and default values
    setEditingProject({
      title: '',
      description: '',
      field: null,
      tools: null,
      logo: null,
      documentation_path: null,
      start_date: new Date().getFullYear(),
      end_date: undefined,
      state: undefined,
    });
    setIsCreatingNew(true);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProject(null);
    setIsCreatingNew(false);
  };

  const handleSave = async () => {
    if (!editingProject) return;

    // Validate required fields
    if (!editingProject.title || !editingProject.description) {
      alert('يرجى ملء العنوان والوصف');
      return;
    }

    try {
      if (isCreatingNew) {
        // Use proposeProject for creating new projects
        const newProject = await projectService.proposeProject(editingProject);
        setProjects(prev => [...prev, newProject]);
        alert('تم إنشاء المشروع بنجاح');
      } else if (editingProject.project_id) {
        // Use updateProject for existing projects
        const updated = await projectService.updateProject(
          editingProject.project_id,
          editingProject
        );
        setProjects(prev =>
          prev.map(p => (p.project_id === updated.project_id ? updated : p))
        );
        alert('تم تحديث المشروع بنجاح');
      }
      handleModalClose();
    } catch (e) {
      console.error(e);
      alert(isCreatingNew ? 'فشل الإنشاء' : 'فشل التحديث');
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const searchLower = search.toLowerCase();
      return (
        p.title?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.field?.toLowerCase().includes(searchLower) ||
        p.tools?.toLowerCase().includes(searchLower) ||
        p.college_name?.toLowerCase().includes(searchLower) ||
        p.university_name?.toLowerCase().includes(searchLower) ||
        p.supervisor_name?.toLowerCase().includes(searchLower) ||
        p.co_supervisor_name?.toLowerCase().includes(searchLower) ||
        p.created_by?.name?.toLowerCase().includes(searchLower) ||
        p.created_by?.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [projects, search]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">المشاريع</h2>

      {/* Search, Export, and Create Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block mb-1 font-medium">بحث:</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن المشروع..."
            className="border border-gray-300 rounded px-3 py-1 w-full"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => exportToCSV('projects.csv', filteredProjects)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            تصدير
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            إضافة مشروع جديد
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-6">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-right text-sm">
            {/* Table Head */}
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black px-4 py-2">ID</th>
                <th className="border border-black px-4 py-2">عنوان المشروع</th>
                <th className="border border-black px-4 py-2">الوصف</th>
                <th className="border border-black px-4 py-2">المجال</th>
                <th className="border border-black px-4 py-2">الأدوات</th>
                <th className="border border-black px-4 py-2">الحالة</th>
                <th className="border border-black px-4 py-2">سنة البداية</th>
                <th className="border border-black px-4 py-2">سنة النهاية</th>
                <th className="border border-black px-4 py-2">المشرف</th>
                <th className="border border-black px-4 py-2">المشرف المشارك</th>
                <th className="border border-black px-4 py-2">الكلية</th>
                <th className="border border-black px-4 py-2">الجامعة</th>
                <th className="border border-black px-4 py-2">مقترح من قبل</th>
                <th className="border border-black px-4 py-2">البريد الإلكتروني</th>
                <th className="border border-black px-4 py-2">الهاتف</th>
                <th className="border border-black px-4 py-2">Documentation Path</th>
                <th className="border border-black px-4 py-2">Logo</th>
                <th className="border border-black px-4 py-2">الإجراءات</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p, idx) => (
                  <tr
                    key={p.project_id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                  >
                    <td className="border border-black px-4 py-2">{p.project_id ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.title ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.description ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.field ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.tools ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.state_name ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.start_date ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.end_date ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.supervisor_name ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.co_supervisor_name ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.college_name ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.university_name ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.created_by?.name ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.created_by?.email ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.created_by?.phone ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.documentation_path ?? '-'}</td>
                    <td className="border border-black px-4 py-2">{p.logo ?? '-'}</td>
                    <td className="border border-black px-4 py-2 flex gap-2 justify-center whitespace-nowrap">
                      <button
                        className="px-3 py-1 text-yellow-700 border border-yellow-700 rounded hover:bg-yellow-100"
                        onClick={() => handleEdit(p)}
                      >
                        تعديل
                      </button>
                      <button
                        className="px-3 py-1 text-rose-700 border border-rose-700 rounded hover:bg-rose-100"
                        onClick={() => handleDelete(p.project_id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={18} className="border border-black py-6 text-center text-gray-400">
                    لا توجد مشاريع
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/2 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {isCreatingNew ? 'إضافة مشروع جديد' : 'تعديل المشروع'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Title */}
              <div className="col-span-2">
                <label className="block mb-1 font-medium">عنوان المشروع *</label>
                <input
                  type="text"
                  value={editingProject.title ?? ''}
                  onChange={e =>
                    setEditingProject(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  placeholder="أدخل عنوان المشروع"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block mb-1 font-medium">الوصف *</label>
                <textarea
                  value={editingProject.description ?? ''}
                  onChange={e =>
                    setEditingProject(prev => ({ ...prev, description: e.target.value }))
                  }
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  placeholder="أدخل وصف المشروع"
                  rows={3}
                />
              </div>

              {/* Field */}
              <div>
                <label className="block mb-1 font-medium">المجال</label>
                <input
                  type="text"
                  value={editingProject.field ?? ''}
                  onChange={e =>
                    setEditingProject(prev => ({ ...prev, field: e.target.value }))
                  }
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  placeholder="مثال: تطوير الويب"
                />
              </div>

              {/* Tools */}
              <div>
                <label className="block mb-1 font-medium">الأدوات</label>
                <input
                  type="text"
                  value={editingProject.tools ?? ''}
                  onChange={e =>
                    setEditingProject(prev => ({ ...prev, tools: e.target.value }))
                  }
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  placeholder="مثال: React, Node.js"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block mb-1 font-medium">سنة البداية</label>
                <input
                  type="number"
                  value={editingProject.start_date ?? ''}
                  onChange={e =>
                    setEditingProject(prev => ({
                      ...prev,
                      start_date: Number(e.target.value) || undefined,
                    }))
                  }
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  placeholder={new Date().getFullYear().toString()}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block mb-1 font-medium">سنة النهاية</label>
                <input
                  type="number"
                  value={editingProject.end_date ?? ''}
                  onChange={e =>
                    setEditingProject(prev => ({
                      ...prev,
                      end_date: Number(e.target.value) || undefined,
                    }))
                  }
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block mb-1 font-medium">Logo</label>
                <input
                  type="text"
                  value={editingProject.logo ?? ''}
                  onChange={e =>
                    setEditingProject(prev => ({ ...prev, logo: e.target.value }))
                  }
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  placeholder="رابط الشعار"
                />
              </div>

              {/* Documentation Path */}
              <div>
                <label className="block mb-1 font-medium">Documentation Path</label>
                <input
                  type="text"
                  value={editingProject.documentation_path ?? ''}
                  onChange={e =>
                    setEditingProject(prev => ({
                      ...prev,
                      documentation_path: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-3 py-1 w-full"
                  placeholder="رابط التوثيق"
                />
              </div>

              {/* State */}
              {states.length > 0 && (
                <div>
                  <label className="block mb-1 font-medium">الحالة</label>
                  <select
                    value={editingProject.state ?? ''}
                    onChange={e =>
                      setEditingProject(prev => ({
                        ...prev,
                        state: Number(e.target.value) || undefined,
                      }))
                    }
                    className="border border-gray-300 rounded px-3 py-1 w-full"
                  >
                    <option value="">اختر الحالة</option>
                    {states.map((state: any) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {isCreatingNew ? 'إنشاء' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsTable;
