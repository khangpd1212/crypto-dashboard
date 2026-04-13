import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./style.css";
import { Provider, rootStore } from "./stores";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider value={rootStore}>
      <App />
    </Provider>
  </React.StrictMode>,
);
