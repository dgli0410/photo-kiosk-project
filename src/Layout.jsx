// src/Layout.jsx
import { useEffect, useRef, useState } from "react";

function FooterBtn({ imgSrc, alt, onClick }) {
    return (
        <button onClick={onClick} className="footer-btn">
            <img src={imgSrc} alt={alt} />
        </button>
    );
}

export default function Layout({ children, onHome, onBack }) {
    const [time, setTime] = useState("");
    const wrapRef = useRef(null);

    useEffect(() => {
        const t = setInterval(() => {
            const d = new Date();
            const h = d.getHours();
            const m = String(d.getMinutes()).padStart(2, "0");
            const ampm = h >= 12 ? "오후" : "오전";
            const hh = String(h % 12 || 12).toString().padStart(2, "0");
            setTime(`${ampm} ${hh}:${m}`);
        }, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const BASE_W = 1080;
        const BASE_H = 1920;
        const apply = () => {
            const scale = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H);
            if (wrapRef.current) wrapRef.current.style.transform = `scale(${scale})`;
        };
        apply();
        window.addEventListener("resize", apply);
        return () => window.removeEventListener("resize", apply);
    }, []);

    return (
        <div className="layout-root">
            <div ref={wrapRef} className="layout-wrap">
                <div className="layout-container">
                    <header className="layout-header">
                        <div className="header-logo-group">
                            <img src="/images/logo-welfare.png" alt="복지관 로고" />
                            <img src="/images/logo-kwangwoon.png" alt="광운대 로고" />
                        </div>
                        <div className="header-time">{time}</div>
                    </header>
                    <main className="layout-main" style={{ backgroundImage: "url('/images/background-color.png')" }}>
                        {children}
                    </main>
                    <nav className="layout-footer">
                        <FooterBtn imgSrc="/images/normal-mode.png" alt="일반모드" />
                        <FooterBtn imgSrc="/images/big-font.png" alt="큰글씨" />
                        <FooterBtn imgSrc="/images/low-screen.png" alt="낮은화면" />
                        <FooterBtn imgSrc="/images/home.png" alt="처음으로" onClick={onHome} />
                        <FooterBtn imgSrc="/images/back.png" alt="이전으로" onClick={onBack} />
                    </nav>
                </div>
            </div>
        </div>
    );
}