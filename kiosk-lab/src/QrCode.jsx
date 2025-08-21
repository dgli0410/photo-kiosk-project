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
            if (onDone) onDone();
        }
    }, [countdown, onDone]);

    if (!imageUrl) {
        return <div className="qr-loading">이미지 URL을 기다리는 중...</div>;
    }

    return (
        <div className="qr-container">
            <div className="qr-text-box">
                <h2 className="qr-title">핸드폰 카메라로 QR을 찍고<br />사진을 다운 받으세요!</h2>
                <p className="qr-countdown-timer">{countdown}</p>
            </div>
            <div className="qr-code-box">
                <QRCodeSVG value={imageUrl} size={400} />
            </div>
            <button onClick={onDone} className="qr-done-button">완료</button>
        </div>
    );
}