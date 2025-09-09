import { useEffect, useRef, useState, useCallback } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs-backend-webgl";

export default function PhotoInstructions({ art, onBack, onStart }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);      // 최종 합성(보이는 캔버스)
    const tempCanvasRef = useRef(null);  // 임시 캔버스
    const bgImageRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);

    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);

    const W = 1080, H = 1920;

    // 🔒 화면에 표시할지 최종 필터
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
            if (!src) { bgImageRef.current = null; return resolve(false); }
            const img = new Image();
            if (/^(https?:)?\/\//i.test(src)) img.crossOrigin = "anonymous";
            img.onload = () => { bgImageRef.current = img; resolve(true); };
            img.onerror = () => { console.warn("[PhotoInstructions] BG load fail:", src); bgImageRef.current = null; resolve(false); };
            img.src = src;
        });

    const renderFrame = useCallback(async (net) => {
        const video = videoRef.current, canvas = canvasRef.current, tempCanvas = tempCanvasRef.current, bg = bgImageRef.current;
        if (!video || !canvas || !tempCanvas) return;

        const tctx = tempCanvas.getContext("2d");
        const ctx = canvas.getContext("2d");

        tctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        const seg = await net.segmentPerson(video, {
            internalResolution: "medium",
            segmentationThreshold: 0.7,
            maxDetections: 1, scoreThreshold: 0.2, nmsRadius: 20,
        });

        const mask = bodyPix.toMask(
            seg,
            { r: 0, g: 0, b: 0, a: 255 },   // 사람=불투명
            { r: 0, g: 0, b: 0, a: 0 }      // 배경=투명
        );
        const maskBmp = await createImageBitmap(mask);
        tctx.globalCompositeOperation = "destination-in";
        tctx.drawImage(maskBmp, 0, 0, tempCanvas.width, tempCanvas.height);
        tctx.globalCompositeOperation = "source-over";

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bg && bg.width) {
            const cr = canvas.width / canvas.height;
            const br = bg.width / bg.height;
            let dw, dh, dx, dy;
            if (br > cr) { dh = canvas.height; dw = dh * br; dx = (canvas.width - dw) / 2; dy = 0; }
            else { dw = canvas.width; dh = dw / br; dx = 0; dy = (canvas.height - dh) / 2; }
            ctx.drawImage(bg, dx, dy, dw, dh);
        } else {
            ctx.fillStyle = "#ddd";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 사람 레이어만 좌우 반전
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        ctx.restore();

    }, []);

    useEffect(() => {
        let mounted = true;
        let net;

        const setup = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: { ideal: W }, height: { ideal: H } },
                    audio: false,
                });
                if (!mounted) return;
                streamRef.current = stream;

                const v = videoRef.current;
                if (v) {
                    v.srcObject = stream;
                    // 🔇 play() 에러 무시 (UI 비표시)
                    await v.play().catch((e) => {
                        if (e?.name === "AbortError" || e?.name === "NotAllowedError") return;
                        if (/play\(\)\s*request\s*was\s*interrupted/i.test(e?.message)) return;
                        console.warn("video.play() error:", e);
                    });
                }

                net = await bodyPix.load({
                    architecture: "MobileNetV1",
                    outputStride: 16,
                    multiplier: 0.75,
                    quantBytes: 2,
                });
                if (!mounted) return;

                await loadBackgroundImage(normalizeArtSrc(art?.imgSrc));

                if (canvasRef.current) { canvasRef.current.width = W; canvasRef.current.height = H; }
                if (tempCanvasRef.current) { tempCanvasRef.current.width = W; tempCanvasRef.current.height = H; }

                setReady(true);

                const loop = async () => {
                    if (!mounted) return;
                    await renderFrame(net);
                    rafRef.current = requestAnimationFrame(loop);
                };
                loop();
            } catch (e) {
                // ❌ UI 노출 차단: 특정 에러는 버림
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
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, [art?.imgSrc, renderFrame]);

    const handleBack = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        onBack?.();
    };
    const handleStart = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        onStart?.();
    };

    return (
        <div className="instr-page">
            <div className="shoot-viewport">
                <canvas ref={canvasRef} className="shoot-canvas" />
                <div className="shoot-overlay" />
                <div className="shoot-instruction">
                    하단의 <b className="shoot-highlight">‘촬영하기’</b> 버튼을<br />눌러서 시작해 주세요.
                </div>
            </div>

            <div className="detail-actions shoot-actions">
                <button className="btn-cancel" onClick={handleBack}>다시 선택</button>
                <button className="btn-photo" onClick={handleStart}>
                    촬영하기 <img src="/images/icon-camera.svg" alt="" />
                </button>
            </div>

            <video ref={videoRef} playsInline muted autoPlay style={{ display: "none" }} />
            <canvas ref={tempCanvasRef} style={{ display: "none" }} />

            {shouldShowError(error) && <div className="shoot-error">{error}</div>}
        </div>
    );
}
