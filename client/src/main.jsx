import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AppLoader from "./common/AppLoader.jsx";
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "./common/ScrollToTop.jsx";
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AppLoader>
          <ScrollToTop />
          <App />
        </AppLoader>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
