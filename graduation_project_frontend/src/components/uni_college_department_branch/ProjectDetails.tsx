import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiCalendar, FiMapPin, FiBookOpen, FiTool, FiUser, FiUsers, 
  FiX, FiInfo, FiFileText, FiBriefcase, FiTag, FiClock, 
  FiImage, FiDownload, FiLink, FiArrowRight, FiHome,
  FiChevronLeft, FiExternalLink, FiPaperclip, FiLock, FiLoader,
  FiMail, FiPhone, FiHash
} from 'react-icons/fi';
import Navbar from '../Navbar';
import { projectService } from '../../services/projectService';
import api from '../../services/api';

interface Student {
  name: string;
  id?: string;
  email?: string;
  phone?: string;
  username?: string;
  gender?: string;
  cid?: string;
}

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
  program_name?: string;
  start_date: number;
  end_date: number;
  external_company?: string;
  supervisor_name: string;
  co_supervisor_name?: string;
  logo?: string;
  documentation_path?: string | null;
  students?: Student[];
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const API_BASE_URL = 'http://localhost:8001';

  // دالة لجلب رابط الصورة
  const getImageUrl = (imagePath?: string): string => {
    if (!imagePath) return '/default-project-logo.png';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${API_BASE_URL}/media/${cleanPath}`;
  };

  // دالة لجلب طلاب المشروع فقط (المجموعات المرتبطة بهذا المشروع)
  const fetchProjectStudents = async (projectId: number) => {
    try {
      setLoadingStudents(true);
      console.log(`🔍 جاري جلب طلاب المشروع رقم: ${projectId}`);
      
      // جلب المجموعات الخاصة بهذا المشروع فقط
      const groups = await projectService.getProjectGroups(projectId);
      
      console.log('📦 البيانات المستلمة من API:', groups);
      
      const studentsMap = new Map();

      if (Array.isArray(groups) && groups.length > 0) {
        // تصفية المجموعات التي تخص هذا المشروع فقط
        const projectGroups = groups.filter((group: any) => 
          group.project === projectId || group.project_id === projectId
        );
        
        console.log(`📊 عدد المجموعات التي تخص المشروع ${projectId}:`, projectGroups.length);
        
        // المرور على كل المجموعات التي تخص المشروع فقط
        projectGroups.forEach((group: any, groupIndex: number) => {
          console.log(`👥 المجموعة ${groupIndex + 1}:`, group);
          
          // التأكد من وجود members في المجموعة
          if (group.members && Array.isArray(group.members)) {
            console.log(`👤 عدد الأعضاء في المجموعة ${groupIndex + 1}:`, group.members.length);
            
            // المرور على كل عضو في المجموعة
            group.members.forEach((member: any, memberIndex: number) => {
              const user = member.user_detail;
              if (user && user.id) {
                console.log(`👨‍🎓 العضو ${memberIndex + 1}:`, user);
                
                // استخدام user.id كمفتاح لتجنب التكرار
                if (!studentsMap.has(user.id)) {
                  studentsMap.set(user.id, {
                    name: user.name || 
                          `${user.first_name || ""} ${user.last_name || ""}`.trim() || 
                          user.username || 
                          "طالب",
                    id: user.id?.toString(),
                    email: user.email || "لا يوجد",
                    phone: user.phone || "لا يوجد",
                    username: user.username || "",
                    gender: user.gender || "",
                    cid: user.CID || "",
                  });
                }
              }
            });
          } else {
            console.log(`⚠️ المجموعة ${groupIndex + 1} لا تحتوي على members`);
          }
        });
      } else {
        console.log('ℹ️ لا توجد مجموعات لهذا المشروع أو البيانات ليست مصفوفة');
      }

      // تحويل Map إلى مصفوفة
      const studentsList = Array.from(studentsMap.values());
      
      console.log(`✅ تم العثور على ${studentsList.length} طالب للمشروع ${projectId}:`, studentsList);
      setStudents(studentsList);
      
      // تحديث المشروع مع إضافة الطلاب
      setProject(prev => prev ? { ...prev, students: studentsList } : null);
      
    } catch (error) {
      console.error("❌ خطأ في جلب طلاب المشروع:", error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
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

  // دالة لعرض محتوى التوثيق
  const renderDocumentation = (doc?: string | null) => {
    if (!doc || doc.trim() === '' || doc === 'null' || doc === 'undefined') {
      return (
        <div className="bg-gray-50 p-8 rounded-xl text-center border-2 border-dashed border-gray-200">
          <FiFileText className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-gray-500 font-medium">لا يوجد ملف توثيق لهذا المشروع</p>
          <p className="text-gray-400 text-sm mt-1">يمكن للمشرف إضافة ملف لاحقاً</p>
        </div>
      );
    }

    return (
      <div className="bg-amber-50/30 p-8 rounded-xl border border-amber-200 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="text-amber-600" size={32} />
        </div>
        
        <h4 className="text-xl font-bold text-amber-800 mb-3">
          ملف توثيق المشروع
        </h4>
        
        <p className="text-amber-700 mb-4 max-w-md mx-auto">
          ملف التوثيق الكامل للمشروع متاح ولكن لا يمكن الوصول إليه حفاظاً على حقوق الملكية الفكرية
        </p>
        
        <div className="bg-white p-4 rounded-lg border border-amber-200 inline-block mx-auto">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FiFileText className="text-amber-600" size={18} />
            <span>{doc.split('/').pop() || 'ملف التوثيق'}</span>
          </p>
        </div>
        
        <div className="mt-4 text-xs text-amber-600 flex items-center justify-center gap-1">
          <FiInfo size={14} />
          <span>للاطلاع على ملف التوثيق، يرجى التواصل مع المشرف</span>
        </div>
      </div>
    );
  };

  // دالة عرض تفاصيل الطالب في نافذة منبثقة (بدون أزرار التواصل)
  const StudentDetailsModal = () => {
    if (!selectedStudent) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300"
        onClick={() => {
          setSelectedStudent(null);
          setShowStudentModal(false);
        }}
      >
        <div 
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn"
          onClick={e => e.stopPropagation()}
        >
          {/* رأس النافذة */}
          <div className="bg-gradient-to-l from-[#31257D] to-[#4937BF] p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <FiUser size={20} />
              <h2 className="text-xl font-bold">تفاصيل الطالب</h2>
            </div>
            <button
              onClick={() => {
                setSelectedStudent(null);
                setShowStudentModal(false);
              }}
              className="hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* محتوى النافذة */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#31257D] to-[#4937BF] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {selectedStudent.name?.charAt(0) || 'ط'}
              </div>
              <h3 className="text-2xl font-bold text-[#31257D]">{selectedStudent.name}</h3>
              {selectedStudent.username && (
                <p className="text-gray-500">@{selectedStudent.username}</p>
              )}
            </div>

            <div className="space-y-4">
              {/* رقم الطالب */}
              {selectedStudent.id && (
                <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl">
                  <div className="w-10 h-10 bg-[#31257D]/10 rounded-full flex items-center justify-center">
                    <FiHash className="text-[#31257D]" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الرقم الجامعي</p>
                    <p className="font-medium text-[#31257D]">{selectedStudent.id}</p>
                  </div>
                </div>
              )}

              {/* البريد الإلكتروني - عرض فقط */}
              <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl">
                <div className="w-10 h-10 bg-[#31257D]/10 rounded-full flex items-center justify-center">
                  <FiMail className="text-[#31257D]" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className={`font-medium ${selectedStudent.email && selectedStudent.email !== "لا يوجد" ? 'text-[#31257D]' : 'text-gray-400'}`}>
                    {selectedStudent.email || "لا يوجد"}
                  </p>
                </div>
              </div>

              {/* رقم الهاتف - عرض فقط */}
              <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl">
                <div className="w-10 h-10 bg-[#31257D]/10 rounded-full flex items-center justify-center">
                  <FiPhone className="text-[#31257D]" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">رقم الهاتف</p>
                  <p className={`font-medium ${selectedStudent.phone && selectedStudent.phone !== "لا يوجد" ? 'text-[#31257D]' : 'text-gray-400'}`}>
                    {selectedStudent.phone || "لا يوجد"}
                  </p>
                </div>
              </div>

              {/* الجنس */}
              {selectedStudent.gender && (
                <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl">
                  <div className="w-10 h-10 bg-[#31257D]/10 rounded-full flex items-center justify-center">
                    <FiUser className="text-[#31257D]" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الجنس</p>
                    <p className="font-medium text-[#31257D]">
                      {selectedStudent.gender === 'Male' ? 'ذكر' : 
                       selectedStudent.gender === 'Female' ? 'أنثى' : 'غير محدد'}
                    </p>
                  </div>
                </div>
              )}

              {/* الرقم الوطني */}
              {selectedStudent.cid && (
                <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl">
                  <div className="w-10 h-10 bg-[#31257D]/10 rounded-full flex items-center justify-center">
                    <FiHash className="text-[#31257D]" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الرقم الوطني</p>
                    <p className="font-medium text-[#31257D]">{selectedStudent.cid}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
        
        // بعد جلب المشروع، جلب الطلاب
        if (response?.project_id) {
          await fetchProjectStudents(response.project_id);
        }
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
                    onError={(e) => {
                      e.currentTarget.src = '/default-project-logo.png';
                    }}
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
                
                {project.program_name && (
                  <div className="border-b border-gray-100 pb-3">
                    <p className="text-sm text-gray-500 mb-1">البرنامج</p>
                    <p className="font-bold text-[#31257D]">{project.program_name}</p>
                  </div>
                )}
                
                {project.branch_name && (
                  <div className="border-b border-gray-100 pb-3">
                    <p className="text-sm text-gray-500 mb-1">الفرع</p>
                    <p className="font-bold text-[#31257D]">{project.branch_name}</p>
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

            {/* الطلاب المشاركون - مع إمكانية عرض التفاصيل */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#31257D] flex items-center gap-2">
                  <FiUsers className="text-[#4937BF]" />
                  الطلاب المشاركون
                </h3>
                {students.length > 0 && (
                  <span className="bg-[#31257D] text-white text-sm px-3 py-1 rounded-full">
                    {students.length}
                  </span>
                )}
                {loadingStudents && (
                  <FiLoader className="animate-spin text-[#4937BF]" size={20} />
                )}
              </div>
              
              {loadingStudents ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#31257D]/20 border-t-[#31257D]"></div>
                  <p className="mt-4 text-gray-500">جاري تحميل الطلاب...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map((student, index) => {
                    const hasEmail = student.email && student.email !== "لا يوجد" && student.email !== "";
                    const hasPhone = student.phone && student.phone !== "لا يوجد" && student.phone !== "";
                    
                    return (
                      <div 
                        key={index} 
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowStudentModal(true);
                        }}
                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:shadow-md transition-all cursor-pointer hover:border-[#31257D]/30 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#31257D] to-[#4937BF] rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
                          {student.name?.charAt(0) || 'ط'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[#31257D] text-base">{student.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            {hasEmail ? (
                              <div className="flex items-center gap-1 text-gray-500">
                                <FiMail size={12} />
                                <span className="truncate max-w-[100px]">{student.email}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-400">
                                <FiMail size={12} />
                                <span>لا يوجد بريد</span>
                              </div>
                            )}
                            {hasPhone ? (
                              <div className="flex items-center gap-1 text-gray-500">
                                <FiPhone size={12} />
                                <span>{student.phone}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-400">
                                <FiPhone size={12} />
                                <span>لا يوجد هاتف</span>
                              </div>
                            )}
                          </div>
                          {student.id && (
                            <p className="text-xs text-gray-400 mt-1">رقم: {student.id}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FiUsers className="mx-auto mb-3 text-gray-400" size={40} />
                  <p className="text-gray-500 font-medium">لا يوجد طلاب مشاركين في هذا المشروع</p>
                  <p className="text-sm text-gray-400 mt-1">يمكن إضافة الطلاب لاحقاً</p>
                </div>
              )}
            </div>

            {/* ملف التوثيق */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#31257D] mb-4 flex items-center gap-2">
                <FiFileText className="text-[#4937BF]" />
                ملف التوثيق
              </h3>
              
              {renderDocumentation(project.documentation_path)}
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

      {/* نافذة تفاصيل الطالب - بدون أزرار */}
      <StudentDetailsModal />

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