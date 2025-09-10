// src/Review.jsx
export default function Review({ capturedImage, onSave, onRetake }) {
    return (
        <div className="review-container">
            <h2 className="review-title font-cafe24">사진이 나왔습니다!</h2>
            <div className="review-image-frame">
                <img src={capturedImage} alt="촬영된 사진" className="review-image" />
            </div>
            <div className="review-button-group review-actions font-cafe24">
                <button onClick={onRetake} className="btn-cancel btn-xl">
                    <span className="btn-label">다시찍기</span>
                </button>
                <button onClick={onSave} className="btn-photo btn-xl">
                    <span className="btn-label">저장하기</span>
                    <img className="btn-icon" src="/images/icon-download.svg" alt="" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}