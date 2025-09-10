// src/QrCode.jsx
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

export default function QrCode({ imageUrl, onDone }) {
    const [countdown, setCountdown] = useState(90);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            onDone?.();
        }
    }, [countdown, onDone]);

    return (
        <div className="qr-container">
            <div className="qr-text-box">
                <h2 className="qr-title font-cafe24">
                    핸드폰 카메라로 QR을 찍고<br />사진을 다운 받으세요!
                </h2>
                <p className="qr-countdown-timer">{countdown}</p>
            </div>

            {/* 카드 여백 없이 꽉 차게 */}
            <div className="qr-code-box">
                <QRCodeSVG
                    value={imageUrl || ""}
                    size={520}                // 필요하면 420~560 사이로 조절
                    includeMargin={false}     // 코드 주변 quiet zone 제거
                    bgColor="transparent"     // 박스 배경색 영향 없음
                    level="M"
                />
            </div>

            <button onClick={onDone} className="qr-done-button">완료</button>
        </div>
    );
}
