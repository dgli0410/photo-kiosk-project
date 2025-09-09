// src/ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext({ mode: "normal", setMode: () => { } });
export const useTheme = () => useContext(ThemeCtx);

export default function ThemeProvider({ children }) {
    const [mode, setMode] = useState(() => localStorage.getItem("kiosk_mode") || "normal");

    useEffect(() => {
        localStorage.setItem("kiosk_mode", mode);
        const root = document.documentElement;
        root.classList.remove("mode-normal", "mode-hc", "mode-low");
        root.classList.add(
            mode === "hc" ? "mode-hc" : mode === "low" ? "mode-low" : "mode-normal"
        );
    }, [mode]);

    return <ThemeCtx.Provider value={{ mode, setMode }}>{children}</ThemeCtx.Provider>;
}
