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

    const W = 1080, H = 1920;

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
            img.onerror = (e) => { console.warn("[PhotoShoot] BG load fail:", src, e); bgImageRef.current = null; resolve(false); };
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

        const mask = bodyPix.toMask(seg, { r: 0, g: 0, b: 0, a: 255 }, { r: 0, g: 0, b: 0, a: 0 });
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
        // 배경(작품)은 그대로 두고, 사람 레이어(tempCanvas)만 좌우 반전해서 얹기
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
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: { ideal: W }, height: { ideal: H } },
                    audio: false,
                });
                if (!mounted) return;
                streamRef.current = stream;
                videoRef.current.srcObject = stream;
                await videoRef.current.play();

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

                // 카운트다운 시작
                setRunning(true);
                setCount(10);
                timer = setInterval(() => {
                    setCount((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setRunning(false);
                            setTimeout(() => handleCapture(), 120); // 자동 촬영
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } catch (e) {
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

    // 디자인: 버튼은 카운트다운 동안 회색 비활성
    const disabled = true;

    return (
        <div className="instr-page">
            <div className="shoot-viewport">
                <canvas ref={canvasRef} className="shoot-canvas" />
                <div className="count-overlay">
                    <div className="count-number">{count}</div>
                    <div className="count-text">← 카메라를 봐주세요!</div>
                </div>
            </div>

            <div className="detail-actions shoot-actions">
                <button className="btn-cancel btn-disabled" disabled={disabled} onClick={onBack}>
                    다시 선택
                </button>
                <button className="btn-photo btn-disabled" disabled={disabled} onClick={handleCapture}>
                    촬영하기 <img src="/images/icon-camera.svg" alt="" />
                </button>
            </div>

            <video ref={videoRef} playsInline muted autoPlay style={{ display: "none" }} />
            <canvas ref={tempCanvasRef} style={{ display: "none" }} />

            {error && <div className="shoot-error">{error}</div>}
        </div>
    );
}
