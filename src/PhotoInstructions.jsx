// src/PhotoInstructions.jsx
export default function PhotoInstructions({ onConfirm }) {
    return (
        <div className="instructions-container">
            <div className="instructions-text-box">
                <p>하단의 '촬영하기' 버튼을</p>
                <p>눌러서 시작해 주세요.</p>
            </div>
            <div className="instructions-button-group">
                <span>다시 선택</span>
                <button onClick={onConfirm} className="start-shooting-button">
                    촬영하기 {/* <img src="/images/icon-camera.svg" /> */}
                </button>
            </div>
        </div>
    );
}