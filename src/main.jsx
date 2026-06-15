import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import store from "./store/store.js";
import { setLoading } from "./store/common-slice";
import { logoutUser, setUser } from "./store/auth-slice";
import { Toaster } from "./components/ui/toaster.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";

import api, { setupApiInterceptors } from "./api/axios";

setupApiInterceptors(store, setLoading, logoutUser, setUser);


createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <Provider store={store}>
        <ErrorBoundary>
          <App />
          <Toaster />
        </ErrorBoundary>
      </Provider>
    </BrowserRouter>
  </HelmetProvider>
);
