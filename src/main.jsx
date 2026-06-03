import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { setLoading } from "./store/common-slice";
import { Toaster } from "./components/ui/toaster.jsx";

import api, { setAuthToken, setupApiInterceptors } from "./api/axios";

setupApiInterceptors(store, setLoading);
try {
  const savedToken = localStorage.getItem("auth_token");
  if (savedToken) {
    const token =
      savedToken.startsWith('"') && savedToken.endsWith('"')
        ? savedToken.slice(1, -1)
        : savedToken;
    setAuthToken(token);
  }
} catch {
  // ignore
}


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
      <Toaster />
    </Provider>
  </BrowserRouter>
);
