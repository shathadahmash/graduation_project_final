import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useStore";
import api, { setAuthToken } from "../services/api";
import { FiAlertCircle, FiEye, FiEyeOff, FiUser, FiLock, FiLoader } from "react-icons/fi";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("auth/login/", { username, password });
      console.log("FULL LOGIN RESPONSE =", response.data);

      const { access, user } = response.data;

      if (!access || !user) {
        throw new Error("لم يتم استلام بيانات تسجيل الدخول كاملة من الخادم");
      }

      const normalizedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        roles: user.roles || [],
        permissions: [],
        department_id: user.department_id,
        college_id: user.college_id,
      };

      console.log("USER =", user);
      console.log("ROLES =", user.roles);
      
      login(normalizedUser, normalizedUser.roles || [], access);

      const primaryRole = normalizedUser.roles[0]?.role__type ?? "";
      console.log("PRIMARY ROLE =", primaryRole);

      if (primaryRole) {
        navigateToDashboard(primaryRole);
      } else {
        setError("هذا الحساب لا يملك صلاحيات وصول (Roles missing)");
      }

    } catch (err: any) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.non_field_errors?.[0] || "فشل تسجيل الدخول، تأكد من البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDashboard = (role: string) => {
    if (!role) return navigate("/");
    const normalized = role.toLowerCase().trim();

    const routePairs: [string, string][] = [
      ["student", "/dashboard/student"],
      ["co-supervisor", "/dashboard/co-supervisor"],
      ["supervisor", "/dashboard/supervisor"],
      ["department head", "/dashboard/department-head"],
      ["dean", "/dashboard/dean"],
      ["university president", "/dashboard/university-president"],
      ["system manager", "/dashboard/system-manager"],
      ["ministry", "/dashboard/ministry"],
      ["external company", "/dashboard/external-company"],
    ];

    for (const [key, path] of routePairs) {
      const re = new RegExp(`\\b${key.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      if (re.test(normalized)) return navigate(path);
    }

    return navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden" dir="rtl">
      
      {/* عناصر خلفية أكاديمية */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#31257D]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#31257D]/20 to-transparent"></div>
      </div>
      
      {/* عناصر زخرفية خلفية */}
      <div className="absolute top-20 right-20 w-64 h-64 border-2 border-[#31257D]/5 rounded-full"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 border-2 border-[#4937BF]/5 rounded-full"></div>
      
      {/* نقاط زخرفية صغيرة */}
      <div className="absolute top-40 left-1/4 w-2 h-2 bg-[#31257D]/10 rounded-full"></div>
      <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-[#4937BF]/10 rounded-full"></div>

      <div className={`w-full max-w-md transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* شريط علوي أكاديمي */}
        <div className="w-16 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full mx-auto mb-6"></div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#31257D]/5">
          
          {/* Header Section - تصميم أكاديمي */}
          <div className="bg-gradient-to-l from-[#31257D] to-[#4937BF] p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/20">
                <FiLock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                تسجيل الدخول
              </h1>
              <p className="text-white/80 text-sm">
                البوابة الموحدة لإدارة مشاريع التخرج
              </p>
            </div>
            
            {/* عناصر زخرفية */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="p-8">
            {/* Error Message - تصميم أنيق */}
            {error && (
              <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4 mb-6 flex gap-3 text-red-700 animate-pulse">
                <FiAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Username Field - تصميم أكاديمي */}
              <div>
                <label className="block text-right text-[#2C3E50] mb-2 text-sm font-medium">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FiUser className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'username' ? 'text-[#31257D]' : 'text-[#A0AEC0]'
                    }`} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pr-12 pl-4 py-3 border rounded-xl text-right transition-all duration-300 outline-none ${
                      focusedField === 'username' 
                        ? 'border-[#31257D] ring-1 ring-[#31257D]/20' 
                        : 'border-gray-200 hover:border-[#31257D]/30'
                    }`}
                    placeholder="أدخل اسم المستخدم"
                    disabled={isLoading}
                  />
                  {focusedField === 'username' && (
                    <span className="absolute -top-2 right-12 text-xs bg-white px-2 text-[#31257D]">
                      اسم المستخدم
                    </span>
                  )}
                </div>
              </div>

              {/* Password Field - تصميم أكاديمي */}
              <div>
                <label className="block text-right text-[#2C3E50] mb-2 text-sm font-medium">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FiLock className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'password' ? 'text-[#31257D]' : 'text-[#A0AEC0]'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pr-12 pl-12 py-3 border rounded-xl text-right transition-all duration-300 outline-none ${
                      focusedField === 'password' 
                        ? 'border-[#31257D] ring-1 ring-[#31257D]/20' 
                        : 'border-gray-200 hover:border-[#31257D]/30'
                    }`}
                    placeholder="أدخل كلمة المرور"
                    disabled={isLoading}
                  />
                  {focusedField === 'password' && (
                    <span className="absolute -top-2 right-12 text-xs bg-white px-2 text-[#31257D]">
                      كلمة المرور
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#A0AEC0] hover:text-[#31257D] transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-left">
                <a 
                  href="#" 
                  className="text-sm text-[#4937BF] hover:text-[#31257D] transition-colors duration-300 border-b border-[#4937BF]/20 hover:border-[#31257D] pb-0.5"
                >
                  نسيت كلمة المرور؟
                </a>
              </div>

              {/* Submit Button - تصميم أكاديمي */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-3.5 bg-gradient-to-r from-[#31257D] to-[#4937BF] text-white font-medium rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <FiLock className="w-5 h-5" />
                      تسجيل الدخول
                    </>
                  )}
                </span>
                {/* تأثير وهج متحرك */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              </button>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-[#4A5568]">
                  ليس لديك حساب؟{' '}
                  <a 
                    href="/register" 
                    className="text-[#31257D] font-medium hover:text-[#4937BF] transition-colors duration-300 border-b border-[#31257D]/20 hover:border-[#31257D]"
                  >
                    إنشاء حساب جديد
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Footer - تصميم أكاديمي */}
          <div className="bg-[#F8FAFC] px-8 py-4 border-t border-[#31257D]/5">
            <div className="flex justify-between items-center text-xs text-[#718096]">
              <p>© 2025 البوابة الموحدة</p>
              <p>
                الدعم الفني: <span className="text-[#31257D]">support@gpms.edu.ye</span>
              </p>
            </div>
          </div>
        </div>

        {/* شريط سفلي */}
        <div className="w-16 h-1 bg-gradient-to-r from-[#31257D] to-[#4937BF] rounded-full mx-auto mt-6"></div>
      </div>
    </div>
  );
};

export default LoginPage;