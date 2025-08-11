import React, { useEffect, useRef, useState } from "react";

export default function KioskMain() {
    const [time, setTime] = useState("");
    const [err, setErr] = useState(null);
    const vref = useRef(null);
    const wrapRef = useRef(null);

    // 1) 시계
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

    // 2) 카메라
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

    // 3) 고정 해상도(1080x1920) 스케일
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

    const handleStart = () => alert("다음 화면으로 이동합니다.");

    return (
        // 화면 가운데에 고정 (배경은 브라우저 배경)
        <div className="fixed inset-0 grid place-items-center bg-gradient-to-b from-pink-50 to-pink-100">
            {/* 디자인 기준 해상도 래퍼 */}
            <div
                ref={wrapRef}
                className="origin-center will-change-transform"
                style={{ width: 1080, height: 1920 }}
            >
                {/* 키오스크 프레임 */}
                <div className="w-[1080px] h-[1920px] bg-white rounded-2xl shadow-2xl ring-4 ring-blue-300 overflow-hidden flex flex-col">
                    {/* HEADER: 항상 흰색 */}
                    <header
                        className="relative z-20 flex items-center justify-between px-15 border-b bg-white"
                        style={{ height: 72 }}
                    >
                        <div className="flex items-center gap-4" style={{ height: 72 }}>
                            <img
                                src="/images/logo-welfare.png"
                                alt="복지관 로고"
                                className="w-auto object-contain"
                                style={{ height: 40 }}
                            />
                            <img
                                src="/images/logo-kwangwoon.png"
                                alt="광운대 로고"
                                className="w-auto object-contain"
                                style={{ height: 40 }}
                            />
                        </div>
                        <div className="text-[28px] font-semibold text-gray-800">{time}</div>
                    </header>

                    {/* MAIN: 배경 이미지는 여기 안에서만 확대/적용 */}
                    <main className="relative flex-1 grid place-items-center overflow-hidden">
                        {/* 배경 이미지(헤더는 침범 X) */}
                        <img
                            src="/images/background-color.png"
                            alt="배경"
                            className="absolute inset-0 w-[150%] h-[150%] object-cover z-0 pointer-events-none"
                        />

                        {/* 카메라 뷰파인더 */}
                        <div
                            className="relative z-10 overflow-hidden rounded-[20px] bg-white ring-[12px] ring-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
                            style={{ width: "70%", aspectRatio: "9 / 12" }}
                        >
                            {err ? (
                                <div className="text-white p-6 text-center text-xl">{err}</div>
                            ) : (
                                <video
                                    ref={vref}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                                />
                            )}
                        </div>

                        {/* 손 전경 */}
                        <img
                            src="/images/hands-fg.png"
                            alt="손 모양"
                            className="absolute bottom-[-3%] w-full z-20 pointer-events-none select-none"
                        />
                    </main>

                    {/* TEXT */}
                    <section className="text-center my-8 px-8">
                        <p className="text-2xl text-gray-600">나눔과 소통의 미학전</p>
                        <h1 className="text-5xl font-extrabold tracking-tighter text-black">
                            작품과 함께 사진찍기
                        </h1>
                        <p className="text-2xl text-gray-600">환영합니다!</p>
                    </section>

                    {/* FOOTER */}
                    <footer className="px-10 pb-8">
                        <button
                            onClick={handleStart}
                            className="w-full py-6 rounded-full bg-[#FF4D80] hover:bg-[#E6396D] text-white text-4xl font-bold shadow-lg flex items-center justify-center gap-3"
                        >
                            시작하기
                            <img src="/images/icon-click.png" alt="클릭" className="h-9" />
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}
