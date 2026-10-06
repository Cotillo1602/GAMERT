import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/global.css";

const host = document.getElementById("root");
if (!host) throw new Error("No se encontró #root");

createRoot(host).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
