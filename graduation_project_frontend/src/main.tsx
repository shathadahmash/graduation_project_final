import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import api from "./services/api";

// Fetch CSRF cookie before rendering the app so subsequent POSTs work
async function bootstrap() {
  try {
    await api.get('csrf/');
  } catch (e) {
    // ignore - app can still render, login may fail without CSRF cookie
    // console.warn('CSRF fetch failed', e);
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
