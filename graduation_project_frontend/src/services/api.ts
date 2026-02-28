
// export default api;
import axios from "axios";

/* =======================
   Axios Instance
======================= */
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  // allow sending/receiving cookies for CSRF/session flows
  withCredentials: true,
});

// Log outgoing requests for debugging (URL, method, Authorization header)
api.interceptors.request.use((config) => {
  try {
    const auth = config.headers?.Authorization || api.defaults.headers.common["Authorization"];
    // eslint-disable-next-line no-console
    console.log('[api] request ->', (config.method || 'GET').toUpperCase(), config.url, 'params:', config.params || null, 'auth:', auth ? 'present' : 'missing');
    // Attach CSRF token from cookie for unsafe HTTP methods
    const method = (config.method || 'get').toLowerCase();
    const unsafe = ['post', 'put', 'patch', 'delete'];
    const getCookie = (name: string) => {
      const matches = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'));
      return matches ? decodeURIComponent(matches[2]) : null;
    };
    if (unsafe.includes(method)) {
      const csrftoken = getCookie('csrftoken') || getCookie('CSRF-TOKEN');
      if (csrftoken && !(config.headers && ('X-CSRFToken' in config.headers || 'X-CSRF-Token' in config.headers))) {
        if (!config.headers) config.headers = {};
        config.headers['X-CSRFToken'] = csrftoken;
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});

/* =======================
   Load Token on Startup
======================= */
// Support both `token` and `access_token` keys (some parts of the app use different names)
const savedToken = localStorage.getItem("token") || localStorage.getItem("access_token");
if (savedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

/* =======================
   Auth Token Helper
======================= */
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Why set isAuthenticated this way?

// This runs when the store is created, so:

// If the page refreshes

// And the token is still in localStorage

//  The user stays logged in

// Without this:

// Refresh page → user logged out

// Bad user experience


export function persistAuthToken(token: string | null) {
  // Keep localStorage keys in sync so different modules find the token
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('access_token', token);
    setAuthToken(token);
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    setAuthToken(null);
  }
}

// Attach response interceptor for better debug output on errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      const resp = err.response;
      if (resp) {
        // Log richer response info for debugging
        console.error('[API ERROR]', {
          status: resp.status,
          method: resp.config.method?.toUpperCase(),
          url: resp.config.url,
          data: resp.data,
          headers: resp.headers,
        });
        if (resp.status === 500) {
          // show a concise message so the user can copy-paste server error
          const msg = resp.data && typeof resp.data === 'object' ? JSON.stringify(resp.data) : String(resp.data);
          // eslint-disable-next-line no-alert
          alert(`Server Error 500: ${msg}`);
        }
      } else {
        console.error('[API ERROR] no response', err);
      }
    } catch (e) {
      console.error('Error handling API error', e);
    }
    return Promise.reject(err);
  }
);

/* =======================
   API ENDPOINTS
======================= */
export const API_ENDPOINTS = {
  LOGIN: "auth/login/",
  ME: "auth/me/",
  STUDENTS: "students/",
  SUPERVISORS: "supervisors/",
  CO_SUPERVISORS: "co-supervisors/",
  STATISTICS: "statistics/",
  PROGRAMS: "programs/",
  PROJECTS: "projects/", // <- add this
};

/* =======================
   ROLES
======================= */
export const ROLES = {
  STUDENT: "student",
  SUPERVISOR: "supervisor",
  CO_SUPERVISOR: "co-supervisor",
  DEAN: "dean",
  DEPARTMENT_HEAD: "department head",
  SYSTEM_MANAGER: "system manager",
  EXTERNAL_COMPANY: "external company",
};

/* =======================
   Default Export
======================= */
export default api;
