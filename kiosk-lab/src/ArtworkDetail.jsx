// src/ArtworkDetail.jsx
export default function ArtworkDetail({ art, onConfirm }) {
    if (!art) return <div>작품 정보가 없습니다.</div>;

    return (
        <div className="artwork-detail-container">
            <img src={art.imgSrc} alt={art.title} className="detail-image" />
            <div className="detail-info-box">
                <h2 className="detail-title">{art.title}</h2>
                <p className="detail-description">
                    따스한 햇살 아래 자유롭게 춤추는 소녀의 모습이 평화로운 오후의 정취를 자아냅니다. 자연과 조화된 환상적인 빛의 표현이 감상자에게 따뜻한 감성을 전합니다.
                </p>
                <div className="artist-info">
                    {/* <img src="/images/artist-placeholder.png" alt={art.artist} className="artist-pic" /> */}
                    <div className="artist-text">
                        <span className="artist-name">{art.artist}</span>
                        <span className="artist-institution">{art.institution}</span>
                    </div>
                </div>
            </div>
            <div className="detail-button-group">
                {/* 선택 취소 버튼은 onBack prop으로 Layout에서 처리됩니다. */}
                <span className="cancel-text">선택 취소</span>
                <button onClick={onConfirm} className="confirm-photo-button">
                    사진찍기 {/* <img src="/images/icon-camera.svg" /> */}
                </button>
            </div>
        </div>
    );
}