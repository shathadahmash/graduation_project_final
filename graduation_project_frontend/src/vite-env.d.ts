/// <reference types="vite/client" />

/**
 * جميع المتغيرات البيئية الخاصة بالمشروع
 * يجب أن تبدأ بـ VITE_ لتكون متاحة داخل import.meta.env
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_OTHER_VAR?: string
  readonly VITE_MODE?: string
  readonly VITE_PORT?: string
  // أضف أي متغير آخر حسب مشروعك
}

/**
 * توسيع ImportMeta لتعرف env
 */
interface ImportMeta {
  readonly env: ImportMetaEnv
}
