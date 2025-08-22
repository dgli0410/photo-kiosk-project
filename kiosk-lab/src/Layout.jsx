// src/Layout.jsx
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider.jsx"; // ✅ 모드 확인

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
    // ✅ App에서 내려주는 모드 전환 콜백
    onSwitchToHC,
    onSwitchToNormal,
    mode = "normal",
}) {
    const { mode: ctxMode } = useTheme(); // 필요시 활용 가능 (현재는 props 우선)
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

    // ✅ 모드별 footer 아이콘 (HC는 SVG)
    const icons = isHC
        ? {
            normal: "/images/hc/normal-btn.svg", // 일반모드로 전환
            big: "/images/hc/big-screen.svg",    // 큰글씨/고대비
            low: "/images/hc/low-screen.svg",    // (임시) 낮은화면 – 별도 SVG 있으면 교체
            home: "/images/hc/home-btn.svg",
            back: "/images/hc/back-btn.svg",
        }
        : {
            normal: "/images/normal-mode.png",
            big: "/images/big-font.png",
            low: "/images/low-screen.png",
            home: "/images/home.png",
            back: "/images/back.png",
        };

    // ✅ 메인 배경: 고대비는 배경 이미지 제거
    const mainStyle = isHC
        ? { backgroundImage: "none" }
        : { backgroundImage: "url('/images/background-color.png')" };

    return (
        <div className="layout-root">
            <div ref={wrapRef} className="layout-wrap">
                <div className="layout-container">
                    {/* 헤더는 항상 동일 */}
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
                        {/* ✅ 일반모드 버튼 → App의 toNormalMode 호출 → 기본 메인으로 이동 */}
                        <FooterBtn
                            imgSrc={icons.normal}
                            alt="일반모드"
                            onClick={onSwitchToNormal}
                            fallback="/images/normal-mode.png"
                        />

                        {/* ✅ 큰글씨(=고대비) 버튼 → App의 toHighContrast 호출 → 고대비 메인으로 이동 */}
                        <FooterBtn
                            imgSrc={icons.big}
                            alt="큰글씨"
                            onClick={onSwitchToHC}
                            fallback="/images/big-font.png"
                        />

                        {/* 낮은화면: 필요 시 onClick 추가 */}
                        <FooterBtn
                            imgSrc={icons.low}
                            alt="낮은화면"
                            fallback="/images/low-screen.png"
                        />

                        {/* 처음으로 / 이전으로: 기존과 동일 */}
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
