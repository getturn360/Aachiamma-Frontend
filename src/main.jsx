import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { Toaster } from "./components/ui/toaster.jsx";

import axios from "axios";
try {
  const savedToken = localStorage.getItem("auth_token");
  if (savedToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

  }
} catch (e) {

}


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
      <Toaster />
    </Provider>
  </BrowserRouter>
);
