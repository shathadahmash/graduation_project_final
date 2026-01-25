import React, { useState, useEffect, useMemo } from 'react';
import { FiFileText, FiDownload, FiFilter, FiSearch, FiPrinter, FiLayers } from 'react-icons/fi';
import { projectService, Project } from '../../../services/projectService';

const ProjectReportPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using getProjects() from the updated service
        const data = await projectService.getProjects();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = stateFilter === 'all' || p.state === stateFilter;
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      return matchesSearch && matchesState && matchesType;
    });
  }, [projects, searchTerm, stateFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: projects.length,
    approved: projects.filter(p => p.state?.toLowerCase() === 'approved').length,
    pending: projects.filter(p => p.state?.toLowerCase() === 'pending').length,
    types: Array.from(new Set(projects.map(p => p.type))).length
  }), [projects]);

  const handleExport = () => {
    const headers = ['Project ID,Title,Type,State,Supervisor,College,Year'];
    const rows = filteredProjects.map(p => 
      `${p.project_id},"${p.title}","${p.type}","${p.state}","${p.supervisor?.name || ''}","${p.college || ''}","${p.year || ''}"`
    );
    const csv = "\uFEFF" + headers.concat(rows).join("\n"); // Added BOM for Excel Arabic support
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "projects_detailed_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <FiLayers className="text-indigo-600" /> تقارير المشاريع التفصيلية
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">تحليل بيانات المشاريع بناءً على الحالة والنوع والكلية</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"><FiPrinter /> طباعة</button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md"><FiDownload /> تصدير البيانات</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">إجمالي المشاريع</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-r-4 border-r-emerald-500">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">المشاريع المعتمدة</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.approved}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-r-4 border-r-amber-500">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">قيد المراجعة</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-r-4 border-r-indigo-500">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">تنوع الأنواع</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{stats.types}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث في العناوين أو الأوصاف..." 
            className="w-full pr-12 pl-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-xl">
            <FiFilter className="text-slate-400 text-xs" />
            <select 
              className="bg-transparent border-none py-2 text-xs font-black text-slate-700 focus:ring-0" 
              value={stateFilter} 
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="approved">معتمد</option>
              <option value="pending">قيد الانتظار</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-xl">
            <FiLayers className="text-slate-400 text-xs" />
            <select 
              className="bg-transparent border-none py-2 text-xs font-black text-slate-700 focus:ring-0" 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">كل الأنواع</option>
              {Array.from(new Set(projects.map(p => p.type))).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest">معلومات المشروع</th>
                <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest">النوع</th>
                <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest">المشرف</th>
                <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest">الحالة</th>
                <th className="px-6 py-5 text-slate-500 font-black text-[10px] uppercase tracking-widest">السنة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">جاري جلب البيانات من النظام...</td></tr>
              ) : filteredProjects.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">لا توجد مشاريع تطابق معايير البحث الحالية</td></tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.project_id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{p.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5 truncate max-w-[250px]">{p.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-[10px] font-black">{p.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                          {p.supervisor?.name?.[0] || '?'}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{p.supervisor?.name || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        p.state?.toLowerCase() === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                        p.state?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-600' : 
                        'bg-rose-100 text-rose-600'
                      }`}>
                        {p.state === 'approved' ? 'معتمد' : p.state === 'pending' ? 'قيد الانتظار' : p.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-bold">{p.year || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectReportPage;