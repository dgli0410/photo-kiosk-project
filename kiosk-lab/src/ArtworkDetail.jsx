export default function ArtworkDetail({ art, onConfirm }) {
    if (!art) return null;

    return (
        <div className="artwork-detail-container">
            <img className="detail-image" src={art.imgSrc} alt={art.title} />

            <div className="detail-card">
                <h2 className="detail-card-title">{art.title}</h2>

                <div className="detail-card-desc">
                    {art.description?.split("\n").map((p, i) => <p key={i}>{p}</p>)}
                </div>

                <hr className="detail-divider" />

                <div className="artist-info-row">
                    {art.artistImage ? (
                        <img className="artist-avatar" src={art.artistImage} alt={art.artist} />
                    ) : (
                        <div className="artist-avatar" />
                    )}
                    <div className="artist-meta">
                        <span className="artist-name-strong">{art.artist}</span>
                        {art.institution && (
                            <span className="artist-institution-muted">{art.institution}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="detail-actions">
                <button className="btn-cancel" onClick={() => history.back()}>선택 취소</button>
                <button className="btn-photo" onClick={onConfirm}>
                    사진찍기 <img src="/images/icon-camera.svg" alt="" />
                </button>
            </div>
        </div>
    );
}
