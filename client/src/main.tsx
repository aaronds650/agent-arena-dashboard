import { createRoot } from "react-dom/client";
import App from "./App";
import { GlobalErrorBoundary } from "./components/GlobalError";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
