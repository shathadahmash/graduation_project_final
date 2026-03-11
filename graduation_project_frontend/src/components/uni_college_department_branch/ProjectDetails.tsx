import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiCalendar, FiMapPin, FiBookOpen, FiTool, FiUser, FiUsers, 
  FiX, FiInfo, FiFileText, FiBriefcase, FiTag, FiClock, 
  FiImage, FiDownload, FiLink, FiArrowRight, FiHome,
  FiChevronLeft, FiExternalLink, FiPaperclip
} from 'react-icons/fi';
import Navbar from '../Navbar';
import { projectService } from '../../services/projectService';

interface Project {
  project_id: number;
  title: string;
  description: string;
  project_type: string;
  state: string;
  field: string;
  tools: string;
  university_name: string;
  branch_name: string;
  college_name: string;
  department_name?: string;
  start_date: number;
  end_date: number;
  external_company?: string;
  supervisor_name: string;
  co_supervisor_name?: string;
  logo?: string;
  documentation?: string;
  students?: { name: string; id?: string }[];
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const API_BASE_URL = 'http://localhost:8000';

  // دالة لجلب رابط الصورة
  const getImageUrl = (imagePath?: string): string => {
    if (!imagePath || imageError) return '/default-project-logo.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}/media/${imagePath.replace(/^\/+/, '')}`;
  };

  // دالة لاستخراج السنة
  const extractYear = (date: number | string): string => {
    if (!date) return 'غير محدد';
    return date.toString().substring(0, 4);
  };

  // دالة لتنسيق التاريخ
  const formatDate = (date: number | string): string => {
    if (!date) return 'غير محدد';
    const dateStr = date.toString();
    if (dateStr.length === 8) {
      return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
    }
    return dateStr;
  };

  // ترجمة نوع المشروع
  const getProjectTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'Governmental': 'حكومي',
      'External': 'شركات خارجية',
      'Proposed': 'مقترح'
    };
    return types[type] || type;
  };

  // الحصول على ألوان نوع المشروع
  const getProjectTypeColors = (type: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string } } = {
      'Governmental': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'External': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      'Proposed': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
    };
    return colors[type] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  };

  // دالة لعرض محتوى التوثيق (غير قابل للتحميل)
  const renderDocumentation = (doc?: string) => {
    if (!doc || doc === 'null' || doc === 'undefined' || doc.trim() === '') {
      return (
        <div className="bg-gray-50 p-8 rounded-xl text-center border-2 border-dashed border-gray-200">
          <FiFileText className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-gray-500 font-medium">لا يوجد ملف توثيق لهذا المشروع</p>
          <p className="text-gray-400 text-sm mt-1">يمكن للمشرف إضافة ملف التوثيق لاحقاً</p>
        </div>
      );
    }

    // إذا كان رابط
    if (doc.startsWith('http')) {
      return (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiLink className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900">رابط المشروع</h4>
              <p className="text-xs text-blue-600">هذا الرابط للعرض فقط - غير قابل للتحميل</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <a 
              href={doc}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all flex items-center gap-2"
            >
              <FiExternalLink size={16} />
              <span className="flex-1">{doc}</span>
            </a>
          </div>
          
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 bg-blue-100/50 p-2 rounded-lg">
            <FiInfo size={14} />
            <span>هذا الرابط مقدم للاطلاع فقط ولا يمكن تحميل الملف مباشرة</span>
          </div>
        </div>
      );
    }

    // إذا كان نص
    return (
      <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <FiFileText className="text-amber-600" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-amber-900">محتوى التوثيق</h4>
            <p className="text-xs text-amber-600">نص وصفي - للعرض فقط</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-amber-100 max-h-80 overflow-y-auto">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{doc}</p>
        </div>
        
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-100/50 p-2 rounded-lg">
          <FiInfo size={14} />
          <span>هذا النص للعرض فقط ولا يمكن تحميله كملف</span>
        </div>
      </div>
    );
  };

  // جلب بيانات المشروع
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(Number(id));
        setProject(response);
      } catch (error) {
        console.error('خطأ في جلب بيانات المشروع:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-['Cairo',sans-serif]" dir="rtl">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#31257D]/20 border-t-[#31257D]"></div>
            <p className="mt-4 text-[#4A5568]">جاري تحميل بيانات المشروع...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-['Cairo',sans-serif]" dir="rtl">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-red-500">المشروع غير موجود</h2>
          <Link to="/projects" className="text-[#31257D] hover:underline mt-4 inline-block">
            العودة إلى قائمة المشاريع
          </Link>
        </div>
      </div>
    );
  }

  const typeColors = getProjectTypeColors(project.project_type);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Cairo',sans-serif]" dir="rtl">
      <Navbar />
      
      {/* مسار التنقل (Breadcrumb) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-[#31257D] flex items-center gap-1">
              <FiHome size={14} />
              الرئيسية
            </Link>
            <FiChevronLeft className="text-gray-400" size={14} />
            <Link to="/projects" className="text-gray-500 hover:text-[#31257D]">
              المشاريع
            </Link>
            <FiChevronLeft className="text-gray-400" size={14} />
            <span className="text-[#31257D] font-medium truncate">{project.title}</span>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* الشريط العلوي الملون حسب نوع المشروع */}
          <div className={`h-2 ${typeColors.bg}`}></div>
          
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* صورة المشروع */}
              <div className="md:w-64 flex-shrink-0">
                <div className="bg-[#F8FAFC] rounded-xl overflow-hidden border-2 border-gray-100">
                  <img
                    src={getImageUrl(project.logo)}
                    alt={project.title}
                    className="w-full h-64 md:h-48 object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>

              {/* معلومات المشروع الأساسية */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${typeColors.bg} ${typeColors.text} ${typeColors.border} border`}>
                    {getProjectTypeLabel(project.project_type)}
                  </span>
                  {project.state && project.state !== 'غير محدد' && (
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {project.state}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-[#31257D] mb-4 leading-tight">
                  {project.title}
                </h1>

                {/* معلومات سريعة في بطاقات */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-[#F8FAFC] p-4 rounded-xl">
                    <FiCalendar className="text-[#4937BF] mb-2" size={20} />
                    <p className="text-xs text-gray-500">سنة البداية</p>
                    <p className="font-bold text-[#31257D]">{extractYear(project.start_date)}</p>
                  </div>
                  
                  <div className="bg-[#F8FAFC] p-4 rounded-xl">
                    <FiClock className="text-[#4937BF] mb-2" size={20} />
                    <p className="text-xs text-gray-500">سنة النهاية</p>
                    <p className="font-bold text-[#31257D]">{extractYear(project.end_date)}</p>
                  </div>
                  
                  <div className="bg-[#F8FAFC] p-4 rounded-xl">
                    <FiUser className="text-[#4937BF] mb-2" size={20} />
                    <p className="text-xs text-gray-500">المشرف</p>
                    <p className="font-bold text-[#31257D] truncate">{project.supervisor_name}</p>
                  </div>
                  
                  {project.co_supervisor_name && (
                    <div className="bg-[#F8FAFC] p-4 rounded-xl">
                      <FiUsers className="text-[#4937BF] mb-2" size={20} />
                      <p className="text-xs text-gray-500">مشرف مساعد</p>
                      <p className="font-bold text-[#4937BF] truncate">{project.co_supervisor_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* شبكة المعلومات التفصيلية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* العمود الأيمن - معلومات المؤسسة */}
          <div className="lg:col-span-1 space-y-6">
            {/* بطاقة الجامعة والكلية */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#31257D] mb-4 flex items-center gap-2">
                <FiMapPin className="text-[#4937BF]" />
                الموقع الأكاديمي
              </h3>
              
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-sm text-gray-500 mb-1">الجامعة</p>
                  <p className="font-bold text-[#31257D] text-lg">{project.university_name}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-sm text-gray-500 mb-1">الكلية</p>
                  <p className="font-bold text-[#31257D]">{project.college_name}</p>
                </div>
                
                {project.department_name && (
                  <div className="border-b border-gray-100 pb-3">
                    <p className="text-sm text-gray-500 mb-1">القسم</p>
                    <p className="font-bold text-[#31257D]">{project.department_name}</p>
                  </div>
                )}
                
                {project.external_company && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">الجهة الخارجية</p>
                    <p className="font-bold text-[#31257D]">{project.external_company}</p>
                  </div>
                )}
              </div>
            </div>

            {/* بطاقة المجال والأدوات */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#31257D] mb-4 flex items-center gap-2">
                <FiBriefcase className="text-[#4937BF]" />
                التخصص والأدوات
              </h3>
              
              <div className="space-y-4">
                {project.field && project.field !== 'غير محدد' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">المجال</p>
                    <div className="bg-[#F8FAFC] p-3 rounded-lg">
                      <p className="text-[#31257D] font-medium">{project.field}</p>
                    </div>
                  </div>
                )}
                
                {project.tools && project.tools !== 'غير محدد' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">الأدوات والتقنيات</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tools.split(',').map((tool, idx) => (
                        <span 
                          key={idx} 
                          className="bg-[#31257D]/10 text-[#31257D] px-3 py-1.5 rounded-full text-sm border border-[#31257D]/20"
                        >
                          {tool.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* زر العودة */}
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-gray-100 text-[#31257D] rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <FiArrowRight size={18} />
              العودة إلى القائمة
            </button>
          </div>

          {/* العمود الأيسر - ملخص المشروع والطلاب والتوثيق */}
          <div className="lg:col-span-2 space-y-6">
            {/* ملخص المشروع */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#31257D] mb-4 flex items-center gap-2">
                <FiBookOpen className="text-[#4937BF]" />
                ملخص المشروع
              </h3>
              <div className="bg-[#F8FAFC] p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {project.description || 'لا يوجد ملخص متاح لهذا المشروع'}
                </p>
              </div>
            </div>

            {/* الطلاب المشاركون */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#31257D] mb-4 flex items-center gap-2">
                <FiUsers className="text-[#4937BF]" />
                الطلاب المشاركون
                {project.students && project.students.length > 0 && (
                  <span className="bg-[#31257D] text-white text-sm px-2 py-0.5 rounded-full mr-2">
                    {project.students.length}
                  </span>
                )}
              </h3>
              
              <div className="bg-[#F8FAFC] p-6 rounded-lg">
                {project.students && project.students.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.students.map((student, index) => (
                      <div 
                        key={index} 
                        className="bg-white p-4 rounded-lg border border-[#31257D]/10 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#31257D]/10 rounded-full flex items-center justify-center">
                            <FiUser className="text-[#31257D]" size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-[#31257D]">{student.name}</p>
                            {student.id && (
                              <p className="text-xs text-gray-500">الرقم الجامعي: {student.id}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiUsers className="mx-auto mb-3 text-gray-400" size={40} />
                    <p className="text-gray-500">لا يوجد طلاب مسجلين في هذا المشروع</p>
                    <p className="text-sm text-gray-400 mt-1">يمكن إضافة الطلاب لاحقاً</p>
                  </div>
                )}
              </div>
            </div>

            {/* ملف التوثيق - غير قابل للتحميل */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#31257D] mb-4 flex items-center gap-2">
                <FiFileText className="text-[#4937BF]" />
                ملف التوثيق
              </h3>
              
              {renderDocumentation(project.documentation)}
            </div>

            {/* معلومات إضافية - تاريخ البداية والنهاية بالتفصيل */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#31257D] mb-4 flex items-center gap-2">
                <FiInfo className="text-[#4937BF]" />
                معلومات إضافية
              </h3>
              
              <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500 mb-1">تاريخ البداية</p>
                  <p className="font-bold text-[#31257D]">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">تاريخ النهاية</p>
                  <p className="font-bold text-[#31257D]">{formatDate(project.end_date)}</p>
                </div>
                {project.external_company && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">جهة خارجية</p>
                    <p className="font-bold text-[#31257D]">{project.external_company}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* إضافة تنسيقات إضافية */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProjectDetails;