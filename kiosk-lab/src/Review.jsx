// src/Review.jsx
export default function Review({ capturedImage, onSave, onRetake }) {
    return (
        <div className="review-container">
            <h2 className="review-title font-cafe24">사진이 나왔습니다!</h2>
            <div className="review-image-frame">
                <img src={capturedImage} alt="촬영된 사진" className="review-image" />
            </div>
            <div className="review-button-group font-cafe24">
                <button onClick={onRetake} className="retake-button">
                    {/* <img src="/images/icon-retry.svg" /> */}
                    다시찍기
                </button>
                <button onClick={onSave} className="save-button font-cafe24">
                    저장하기
                    {/* <img src="/images/icon-download.svg" /> */}
                </button>
            </div>
        </div>
    );
}