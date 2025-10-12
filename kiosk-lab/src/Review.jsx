// src/Review.jsx
import { useState } from "react";

export default function Review({ capturedImage, onSave, onRetake }) {
    const [saving, setSaving] = useState(false);

    const handleSaveClick = () => {
        if (saving) return;            // 중복 클릭 방지
        setSaving(true);               // ✅ 오버레이 즉시 표시

        try {
            const ret = onSave?.();      // 부모(App)의 저장/업로드 → QR 화면 전환
            // onSave가 Promise를 반환하면 실패 시 오버레이 해제
            if (ret && typeof ret.then === "function") {
                ret.catch((err) => {
                    console.error(err);
                    setSaving(false);
                    alert("업로드가 지연되었어요. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.");
                });
            }
        } catch (e) {
            console.error(e);
            setSaving(false);
            alert("저장 중 오류가 발생했어요. 다시 시도해 주세요.");
        }
    };

    return (
        <div className="review-container with-actionbar" aria-busy={saving}>
            <h2 className="review-title font-cafe24">사진이 나왔습니다!</h2>

            <div className="review-image-frame">
                <img src={capturedImage} alt="촬영된 사진" className="review-image" />
            </div>

            <div className="review-button-group font-cafe24 fixed-action-bar">
                <button
                    onClick={onRetake}
                    className="retake-button"
                    disabled={saving}
                    aria-disabled={saving}
                >
                    {/* <img src="/images/icon-retry.svg" /> */}
                    다시찍기
                </button>

                <button
                    onClick={handleSaveClick}
                    className="save-button font-cafe24"
                    disabled={saving}
                    aria-disabled={saving}
                >
                    저장하기
                    {/* <img src="/images/icon-download.svg" /> */}
                </button>
            </div>

            {/* ✅ 저장 중일 때만, 리뷰 화면 위에 얹히는 로딩 오버레이 */}
            {saving && (
                <div className="review-loading-overlay" role="status" aria-live="polite">
                    <div className="loading-spinner" />
                    <p className="loading-text font-cafe24">QR을 준비하고 있어요…</p>
                </div>
            )}
        </div>
    );
}
