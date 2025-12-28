import { createRoot } from "react-dom/client";
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import App from "./App";
import "./index.css";

CapacitorUpdater.notifyAppReady();

createRoot(document.getElementById("root")!).render(<App />);
