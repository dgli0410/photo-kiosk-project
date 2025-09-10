// src/Layout.jsx
import { useEffect, useRef, useState } from "react";

function FooterBtn({ imgSrc, alt, onClick, fallback }) {
    return (
        <button onClick={onClick} className="footer-btn">
            <img
                src={imgSrc}
                alt={alt}
                onError={(e) => {
                    if (fallback) e.currentTarget.src = fallback;
                }}
            />
        </button>
    );
}

export default function Layout({
    children,
    onHome,
    onBack,
    onSwitchToHC,
    onSwitchToNormal,
    onSwitchToLow,
    mode = "normal",
}) {
    const isHC = mode === "hc";

    const [time, setTime] = useState("");
    const wrapRef = useRef(null);

    // 시계
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

    // 스케일
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

    // mode에 따라 low 아이콘만 다르게 처리
    const icons = isHC
        ? {
            normal: "/images/hc/normal-btn.svg",
            big: "/images/hc/big-screen.svg",
            low: "/images/hc/low-screen.svg",   // 고대비 모드 그대로
            home: "/images/hc/home-btn.svg",
            back: "/images/hc/back-btn.svg",
        }
        : mode === "low"
            ? {
                normal: "/images/hc/normal-btn.svg",
                big: "/images/big-font.png",
                low: "/images/low-low-screen.svg",   // ⬅ 낮은 화면 모드일 때
                home: "/images/home.png",
                back: "/images/back.png",
            }
            : {
                normal: "/images/normal-mode.png",
                big: "/images/big-font.png",
                low: "/images/low-screen.png",   // ⬅ 일반 모드일 때
                home: "/images/home.png",
                back: "/images/back.png",
            };
    const mainStyle = isHC
        ? { backgroundImage: "none" }
        : { backgroundImage: "url('/images/background-color.png')" };

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

                    <main className="layout-main" style={mainStyle}>
                        {children}
                    </main>

                    <nav className="layout-footer">
                        <FooterBtn
                            imgSrc={icons.normal}
                            alt="일반모드"
                            onClick={onSwitchToNormal}
                            fallback="/images/normal-mode.png"
                            active={mode==="normal"}
                        />
                        <FooterBtn
                            imgSrc={icons.big}
                            alt="큰글씨"
                            onClick={onSwitchToHC}
                            fallback="/images/big-font.png"
                            active={mode==="hc"}
                        />
                        <FooterBtn
                            imgSrc={icons.low}
                            alt="낮은화면"
                            onClick={onSwitchToLow}
                            fallback="/images/low-screen.png"
                            active={mode==="low"}
                        />
                        <FooterBtn
                            imgSrc={icons.home}
                            alt="처음으로"
                            onClick={onHome}
                            fallback="/images/home.png"
                        />
                        <FooterBtn
                            imgSrc={icons.back}
                            alt="이전으로"
                            onClick={onBack}
                            fallback="/images/back.png"
                        />
                    </nav>
                </div>
            </div>
        </div>
    );
}
