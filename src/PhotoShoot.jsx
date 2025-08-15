// PhotoShoot.jsx
import { useEffect, useRef, useState, useCallback } from "react";
// BodyPix는 프로젝트에 이미 설치되어 있다고 가정 (@tensorflow-models/body-pix)
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs-backend-webgl";

export default function PhotoShoot({ art, onCapture }) {
    /**
     * props:
     * - art: { imgSrc: string, ... }  // 배경(작품) 이미지 경로
     * - onCapture(dataURL: string): 촬영 완료 콜백
     */

    const videoRef = useRef(null);
    const canvasRef = useRef(null);        // 최종 합성 캔버스 (화면에 보이는 것)
    const tempCanvasRef = useRef(null);    // 임시 캔버스(비디오 프레임 자르기 용)
    const bgImageRef = useRef(null);       // 배경(작품) 이미지
    const rafRef = useRef(null);

    const [ready, setReady] = useState(false);
    const [error, setError] = useState("");

    // 화면/출력 크기 (1080x1920 세로형 기본값, 필요 시 조정)
    const W = 1080;
    const H = 1920;

    // 비디오/모델/이미지 로드
    useEffect(() => {
        let stream;
        let mounted = true;
        let net;

        const setup = async () => {
            try {
                // 1) 카메라 확보
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: { ideal: W },
                        height: { ideal: H },
                    },
                    audio: false,
                });
                if (!mounted) return;
                if (!videoRef.current) return;

                videoRef.current.srcObject = stream;
                await videoRef.current.play();

                // 2) BodyPix 모델 로드
                net = await bodyPix.load({
                    architecture: "MobileNetV1",
                    outputStride: 16,
                    multiplier: 0.75,
                    quantBytes: 2,
                });
                if (!mounted) return;

                // 3) 배경(작품) 이미지 로드
                await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        bgImageRef.current = img;
                        resolve();
                    };
                    img.onerror = reject;
                    img.src = art?.imgSrc || ""; // 빈 값이면 일단 투명 배경으로 진행
                });

                // 4) 캔버스 크기 세팅
                if (canvasRef.current) {
                    canvasRef.current.width = W;
                    canvasRef.current.height = H;
                }
                if (tempCanvasRef.current) {
                    tempCanvasRef.current.width = W;
                    tempCanvasRef.current.height = H;
                }

                setReady(true);

                // 5) 렌더 루프 시작
                const loop = async () => {
                    if (!mounted) return;
                    await renderFrame(net);
                    rafRef.current = requestAnimationFrame(loop);
                };
                loop();
            } catch (e) {
                console.error(e);
                setError(
                    e?.message ||
                    "카메라/모델/이미지 초기화 중 오류가 발생했습니다. HTTPS 환경과 카메라 권한을 확인하세요."
                );
            }
        };

        setup();

        // 정리
        return () => {
            mounted = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
            }
        };
    }, [art?.imgSrc]);

    // 한 프레임 렌더링
    const renderFrame = useCallback(
        async (net) => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const tempCanvas = tempCanvasRef.current;
            const bg = bgImageRef.current;

            if (!video || !canvas || !tempCanvas) return;

            const tempCtx = tempCanvas.getContext("2d");
            const ctx = canvas.getContext("2d");

            // 0) 임시 캔버스 초기화
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            // 1) 비디오 프레임 먼저 그리기
            // - 비디오는 모델엔 미러링 없이 넣고,
            // - 보여줄 때(최종 캔버스)만 좌우반전하고 싶다면 아래 UI 단계에서만 transform을 쓰세요.
            tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

            // 2) 사람 세그멘테이션
            //    정확도/속도는 파라미터로 조정 가능
            const segmentation = await net.segmentPerson(video, {
                internalResolution: "medium",
                segmentationThreshold: 0.7,
                maxDetections: 1,
                scoreThreshold: 0.2,
                nmsRadius: 20,
            });

            // 3) "사람=불투명(255), 배경=투명(0)" 마스크 생성
            const personMask = bodyPix.toMask(
                segmentation,
                { r: 0, g: 0, b: 0, a: 255 }, // foreground (사람): 불투명
                { r: 0, g: 0, b: 0, a: 0 } // background: 투명
            );
            const maskBitmap = await createImageBitmap(personMask, {
                imageOrientation: "none",
            });

            // 4) 임시 캔버스에서 사람 영역만 남기기
            tempCtx.globalCompositeOperation = "destination-in";
            tempCtx.drawImage(maskBitmap, 0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.globalCompositeOperation = "source-over";

            // 5) 최종 캔버스 합성: 배경(작품) → 사람
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // PhotoShoot.jsx 파일의 138번째 줄 근처

            // 배경(작품) 이미지가 있으면 먼저 그림
            if (bg && bg.width > 0) {
                const canvasRatio = canvas.width / canvas.height;
                const bgRatio = bg.width / bg.height;
                let dWidth, dHeight, dx, dy;

                // 이미지 비율에 맞춰 'cover' 효과를 직접 계산
                if (bgRatio > canvasRatio) {
                    // 이미지가 캔버스보다 넓은 경우 (가로로 긴 이미지)
                    dHeight = canvas.height;
                    dWidth = dHeight * bgRatio;
                    dx = (canvas.width - dWidth) / 2;
                    dy = 0;
                } else {
                    // 이미지가 캔버스보다 좁거나 같은 경우 (세로로 긴 이미지)
                    dWidth = canvas.width;
                    dHeight = dWidth / bgRatio;
                    dx = 0;
                    dy = (canvas.height - dHeight) / 2;
                }
                ctx.drawImage(bg, dx, dy, dWidth, dHeight);
            } else {
                // 작품 이미지가 없으면 회색 바탕
                ctx.fillStyle = "#ddd";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // 사람(임시 캔버스 결과) 얹기
            ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        },
        []
    );

    const handleCapture = () => {
        if (!canvasRef.current) return;
        const dataURL = canvasRef.current.toDataURL("image/jpeg", 0.92);
        onCapture?.(dataURL);
    };

    return (
        <div className="photo-container" style={{ width: "100%", height: "100%" }}>
            {/* 비디오는 숨김(모델 입력으로만 사용). 필요하면 작은 프리뷰로 보여도 됨 */}
            <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                style={{ display: "none" }}
            />

            {/* 최종 합성 결과를 보여주는 캔버스 (여기서는 UI만 좌우반전하고 싶을 때만 transform) */}
            <div
                className="canvas-wrap"
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#000",
                }}
            >
                <canvas
                    ref={canvasRef}
                    // 필요 시 미러 표시(화면만 뒤집고, 모델 입력은 그대로 유지)
                    // style={{ transform: "scaleX(-1)" }}
                    style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 16 }}
                />
            </div>

            {/* 임시 캔버스(비디오 자르기 용) - 화면 표시 X */}
            <canvas ref={tempCanvasRef} style={{ display: "none" }} />

            {/* 하단 컨트롤 */}
            <div
                className="controls"
                style={{
                    position: "absolute",
                    bottom: 24,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                }}
            >
                <button
                    onClick={handleCapture}
                    disabled={!ready}
                    className="px-10 py-4 text-3xl rounded-xl text-white"
                    style={{
                        background: ready ? "#e11d48" : "#9ca3af",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                    }}
                >
                    {ready ? "촬영하기" : "준비 중..."}
                </button>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        right: 16,
                        padding: 12,
                        background: "rgba(239,68,68,0.9)",
                        color: "#fff",
                        borderRadius: 8,
                        fontSize: 16,
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
}
