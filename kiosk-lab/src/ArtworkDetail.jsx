// src/ArtworkDetail.jsx
export default function ArtworkDetail({ art, onConfirm, onCancel }) {
    if (!art) return null;

    return (
        <div className="artwork-detail-container">
            <img className="detail-image" src={art.imgSrc} alt={art.title} />

            <div className="detail-card">
                <h3 className="detail-card-title">{art.title}</h3>

                <div className="detail-card-desc">
                    {art.description?.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                </div>

                <hr className="detail-divider" />

                <div className="artist-info-row">
                    <img className="artist-avatar" src={art.artistImage} alt={art.artist} />
                    <div className="artist-meta">
                        <span className="artist-name-strong">{art.artist}</span>
                        <span className="artist-institution-muted">{art.institution}</span>
                    </div>
                </div>
            </div>

            <div className="detail-actions">
                {/* 취소 버튼에 onCancel 연결 */}
                <button type="button" className="btn-cancel font-cafe24 btn-xl" onClick={() => onCancel?.()}>
                    선택 취소
                </button>

                <button type="button" className="btn-photo font-cafe24 btn-xl" onClick={() => onConfirm?.()}>
                    촬영하기 <img src="/images/icon-camera.svg" alt="" />
                </button>
            </div>
        </div>
    );
}
