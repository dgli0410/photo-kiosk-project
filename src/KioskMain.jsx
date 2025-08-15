// src/KioskMain.jsx
import React, { useEffect, useRef, useState } from "react";

export default function KioskMain({ onStart }) {
    const [time, setTime] = useState("");
    const [err, setErr] = useState(null);
    const vref = useRef(null);
    const wrapRef = useRef(null);

    // 시계
    useEffect(() => {
        const t = setInterval(() => {
            const d = new Date();
            const h = d.getHours();
            const m = String(d.getMinutes()).padStart(2, "0");
            const ampm = h >= 12 ? "오후" : "오전";
            const hh = String(h % 12 || 12).padStart(2, "0");
            setTime(`${ampm} ${hh}:${m}`);
        }, 1000);
        return () => clearInterval(t);
    }, []);

    // 카메라
    useEffect(() => {
        (async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: true });
                if (vref.current) vref.current.srcObject = s;
            } catch {
                setErr("카메라를 사용할 수 없습니다. 권한을 확인해주세요.");
            }
        })();
        return () => {
            const s = vref.current?.srcObject;
            s && s.getTracks().forEach((t) => t.stop());
        };
    }, []);

    // 스케일
    useEffect(() => {
        const BASE_W = 1080;
        const BASE_H = 1920;
        const applyScale = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const scale = Math.min(vw / BASE_W, vh / BASE_H);
            if (wrapRef.current) wrapRef.current.style.transform = `scale(${scale})`;
        };
        applyScale();
        window.addEventListener("resize", applyScale);
        return () => window.removeEventListener("resize", applyScale);
    }, []);

    return (
        <div className="kiosk-main-root">
            <div ref={wrapRef} className="layout-wrap">
                <div className="layout-container">
                    <header className="layout-header">
                        <div className="header-logo-group">
                            <img src="/images/logo-welfare.png" alt="복지관 로고" />
                            <img src="/images/logo-kwangwoon.png" alt="광운대 로고" />
                        </div>
                        <div className="header-time">{time}</div>
                    </header>

                    <main
                        className="kiosk-main-content"
                        style={{
                            backgroundImage: "url('/images/background-color.png')",
                            backgroundSize: "180% 180%",
                            backgroundPosition: "center 70%",
                        }}
                    >
                        <img src="/images/hearts-bg.png" alt="하트 배경" className="kiosk-main-hearts-bg" />
                        <div className="kiosk-main-viewport" style={{ width: "70%", aspectRatio: "4/5" }}>
                            <div className="viewport-inner-frame">
                                {err ? (
                                    <div className="viewport-error">{err}</div>
                                ) : (
                                    <video ref={vref} autoPlay playsInline muted />
                                )}
                            </div>
                        </div>

                        <section className="kiosk-main-text-section">
                            <p>나눔과 소통의 미학전</p>
                            <h1>작품과 함께 사진찍기</h1>
                            <p>환영합니다!</p>
                        </section>

                        <img src="/images/hands-fg.png" alt="손 모양" className="kiosk-main-hands-fg" />
                        <button className="kiosk-main-start-btn" onClick={onStart}>
                            <img src="/images/icon-click.png" alt="시작하기" />
                        </button>
                    </main>

                </div>
            </div>
        </div>
    );
}