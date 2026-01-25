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

  useEffect(() => {
    // Trigger animations after component mounts
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. إرسال طلب تسجيل الدخول
      const response = await api.post("auth/login/", { username, password });

      console.log("FULL LOGIN RESPONSE =", response.data);

      const { access, user } = response.data;

      // 2. التحقق من وجود التوكن وبيانات المستخدم (بدون تخمين)
      if (!access || !user) {
        throw new Error("لم يتم استلام بيانات تسجيل الدخول كاملة من الخادم");
      }

      // 3. حفظ التوكن سيقوم به useStore.login (يتعامل مع localStorage و Axios)

      // 4. تحويل بيانات المستخدم لتطابق هيكلية الـ Store (Normalized User)
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
      // 5. تنفيذ دالة الـ login لتحديث الحالة العالمية في التطبيق
      // login expects (user, roles[], token)
      login(normalizedUser, normalizedUser.roles || [], access);

      // 6. استخدام دالة navigateToDashboard المخصصة لديك للتوجيه
      // نمرر أول دور موجود في قائمة الأدوار
     const primaryRole =
  normalizedUser.roles[0]?.role__type ?? "";
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
    if (!role) return navigate("HomePage");
    const normalized = role.toLowerCase().trim();

  // ...existing code...
    const routePairs: [string, string][] = [
      ["student", "./dashboard/StudentDashboard"],
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
// ...existing code...


    return navigate("homepage");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4" dir="rtl">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="w-full max-w-lg bg-white text-slate-800 rounded-3xl shadow-lg p-10 relative z-10 border border-slate-100">

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl mb-4 shadow-md">
            <FiLock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            أدخل بيانات حسابك للمتابعة في النظام
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4 mb-6 flex gap-3 text-red-700">
            <FiAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="group">
            <label className="block text-right text-slate-600 mb-2 font-medium">
              اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiUser className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-right transition-all duration-300 bg-white text-slate-800 placeholder-slate-400"
                placeholder="أدخل اسم المستخدم"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="group">
            <label className="block text-right text-slate-600 mb-2 font-medium">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiLock className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-12 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-right transition-all duration-300 bg-white text-slate-800 placeholder-slate-400"
                placeholder="أدخل كلمة المرور"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-800 disabled:opacity-60 transform transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                جاري التسجيل...
              </>
            ) : (
              <>
                <FiLock className="w-5 h-5" />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-slate-500">
            الدعم الفني: <span className="text-blue-600 hover:opacity-80 transition-colors">support@gpms.edu.ye</span>
          </p>
          <p className="text-xs text-slate-400">
            © 2025 البوابة الموحدة لمشاريع التخرج
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
