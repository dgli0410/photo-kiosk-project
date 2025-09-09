// src/PhotoShoot.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs-backend-webgl";

export default function PhotoShoot({ art, onCapture, onBack }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const tempCanvasRef = useRef(null);
    const bgImageRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);

    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);
    const [count, setCount] = useState(10);
    const [running, setRunning] = useState(false);

    const W = 1080,
        H = 1920;

    // 특정 재생 오류는 UI에 노출하지 않음
    const shouldShowError = (msg) => {
        if (!msg) return false;
        const s = String(msg);
        if (/AbortError/i.test(s)) return false;
        if (/NotAllowedError/i.test(s)) return false;
        if (/play\(\)\s*request\s*was\s*interrupted/i.test(s)) return false;
        return true;
    };

    const normalizeArtSrc = (src) => {
        if (!src) return "";
        if (/^(blob:|data:|https?:\/\/|\/)/i.test(src)) return src;
        return `/${src.replace(/^\.?\//, "")}`;
    };

    const loadBackgroundImage = (src) =>
        new Promise((resolve) => {
            if (!src) {
                bgImageRef.current = null;
                return resolve(false);
            }
            const img = new Image();
            if (/^(https?:)?\/\//i.test(src)) img.crossOrigin = "anonymous";
            img.onload = () => {
                bgImageRef.current = img;
                resolve(true);
            };
            img.onerror = (e) => {
                console.warn("[PhotoShoot] BG load fail:", src, e);
                bgImageRef.current = null;
                resolve(false);
            };
            img.src = src;
        });

    const renderFrame = useCallback(async (net) => {
        const video = videoRef.current,
            canvas = canvasRef.current,
            tempCanvas = tempCanvasRef.current,
            bg = bgImageRef.current;
        if (!video || !canvas || !tempCanvas) return;

        const tctx = tempCanvas.getContext("2d");
        const ctx = canvas.getContext("2d");

        // 1) 비디오 프레임
        tctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        // 2) 사람 세그멘테이션
        const seg = await net.segmentPerson(video, {
            internalResolution: "medium",
            segmentationThreshold: 0.7,
            maxDetections: 1,
            scoreThreshold: 0.2,
            nmsRadius: 20,
        });

        // 3) 사람만 남기는 마스크
        const mask = bodyPix.toMask(
            seg,
            { r: 0, g: 0, b: 0, a: 255 },
            { r: 0, g: 0, b: 0, a: 0 }
        );
        const maskBmp = await createImageBitmap(mask);
        tctx.globalCompositeOperation = "destination-in";
        tctx.drawImage(maskBmp, 0, 0, tempCanvas.width, tempCanvas.height);
        tctx.globalCompositeOperation = "source-over";

        // 4) 최종 캔버스: 배경(작품) → (좌우반전된) 사람
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bg && bg.width) {
            const cr = canvas.width / canvas.height;
            const br = bg.width / bg.height;
            let dw, dh, dx, dy;
            if (br > cr) {
                dh = canvas.height;
                dw = dh * br;
                dx = (canvas.width - dw) / 2;
                dy = 0;
            } else {
                dw = canvas.width;
                dh = dw / br;
                dx = 0;
                dy = (canvas.height - dh) / 2;
            }
            ctx.drawImage(bg, dx, dy, dw, dh);
        } else {
            ctx.fillStyle = "#ddd";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 사람 레이어만 좌우반전해서 합성
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    }, []);

    useEffect(() => {
        let mounted = true;
        let net;
        let timer;

        const setup = async () => {
            try {
                // 1) 카메라
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: { ideal: W }, height: { ideal: H } },
                    audio: false,
                });
                if (!mounted) return;
                streamRef.current = stream;

                const v = videoRef.current;
                if (v) {
                    v.srcObject = stream;
                    await v.play().catch((e) => {
                        if (e?.name === "AbortError" || e?.name === "NotAllowedError") return;
                        if (/play\(\)\s*request\s*was\s*interrupted/i.test(e?.message)) return;
                        console.warn("video.play() error:", e);
                    });
                }

                // 2) BodyPix
                net = await bodyPix.load({
                    architecture: "MobileNetV1",
                    outputStride: 16,
                    multiplier: 0.75,
                    quantBytes: 2,
                });
                if (!mounted) return;

                // 3) 배경 이미지
                await loadBackgroundImage(normalizeArtSrc(art?.imgSrc));

                // 4) 캔버스 크기
                if (canvasRef.current) {
                    canvasRef.current.width = W;
                    canvasRef.current.height = H;
                }
                if (tempCanvasRef.current) {
                    tempCanvasRef.current.width = W;
                    tempCanvasRef.current.height = H;
                }

                setReady(true);

                // 5) 렌더 루프
                const loop = async () => {
                    if (!mounted) return;
                    await renderFrame(net);
                    rafRef.current = requestAnimationFrame(loop);
                };
                loop();

                // 6) 카운트다운 → 자동 촬영
                setRunning(true);
                setCount(10);
                timer = setInterval(() => {
                    setCount((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setRunning(false);
                            setTimeout(() => handleCapture(), 120);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } catch (e) {
                if (
                    e?.name === "AbortError" ||
                    e?.name === "NotAllowedError" ||
                    /play\(\)\s*request\s*was\s*interrupted/i.test(e?.message)
                ) {
                    return;
                }
                console.error(e);
                setError(e?.message || "카메라/모델 초기화 오류입니다.");
            }
        };

        setup();

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        };
    }, [art?.imgSrc, renderFrame]);

    const handleCapture = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.92);
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        onCapture?.(dataUrl);
    };

    // ✅ 다시 선택: 루프/스트림 먼저 정리 → 화면 전환
    const handleBackClick = () => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        const s = streamRef.current;
        if (s) {
            s.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        onBack?.(); // App.jsx에서 setScreen('artworks') 연결됨
    };

    const captureDisabled = true; // 카운트다운 중 비활성 유지(디자인 요구)

    return (
        <div className="instr-page">
            <div className="shoot-viewport">
                <canvas ref={canvasRef} className="shoot-canvas" />
                <div className="count-overlay">
                    <div className="count-number">{count}</div>
                    <div className="count-text"> 상단의 카메라를 봐주세요!</div>
                </div>
            </div>

            <div className="detail-actions shoot-actions">
                <button type="button" className="btn-cancel" onClick={handleBackClick}>
                    다시 선택
                </button>
                <button
                    type="button"
                    className={`btn-photo${captureDisabled ? " btn-disabled" : ""}`}
                    disabled={captureDisabled}
                    onClick={handleCapture}
                >
                    촬영하기 <img src="/images/icon-camera.svg" alt="" />
                </button>
            </div>

            <video ref={videoRef} playsInline muted autoPlay style={{ display: "none" }} />
            <canvas ref={tempCanvasRef} style={{ display: "none" }} />

            {shouldShowError(error) && <div className="shoot-error">{error}</div>}
        </div>
    );
}
