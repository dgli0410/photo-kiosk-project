// src/ThemeSelect.jsx
import { useTheme } from "./ThemeProvider.jsx"; // ✅ 현재 모드 사용

export default function ThemeSelect({ onSelectArt }) {
    const { mode } = useTheme();
    const isHC = mode === "hc";
    const isLow = mode === "low";

    const pick = (kind) => {
        if (kind === "작품과 같이 찍기") {
            onSelectArt();
        } else {
            alert(`${kind} 선택! (여기서 다음 단계로 이동 처리)`);
        }
    };

    // ✅ 모드별 버튼 이미지 경로 (일반/고대비는 기존 유지, 낮은화면만 별도 SVG)
    const withArtworkSrc = isLow
        ? "/images/with-artwork-low.svg"
        : isHC
            ? "/images/hc/with-picture.png"      // (기존)
            : "/images/with-picture.png";         // (기존)

    const withThemeSrc = isLow
        ? "/images/with-theme-low.svg"
        : isHC
            ? "/images/hc/with-theme.png"         // (기존)
            : "/images/with-theme.png";           // (기존)

    // ⬇ 모드별 onError 폴백 (낮은화면 SVG가 없으면 각 모드의 기본 이미지로)
    const handleArtworkErr = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = isHC ? "/images/with-picture.png" : "/images/with-picture.png";
    };
    const handleThemeErr = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = isHC ? "/images/with-theme.png" : "/images/with-theme.png";
    };

    return (
        <div className="theme-select-container">
            <h2 className="page-title font-cafe24">원하는 테마를 선택해주세요!</h2>

            {/* ⬇ 낮은화면일 때만 가로 2열 레이아웃 클래스 부여 */}
            <div className={`theme-select-body ${isLow ? "theme-select-low" : ""}`}>
                <button onClick={() => pick("작품과 같이 찍기")} aria-label="작품과 같이 찍기">
                    <img src={withArtworkSrc} onError={handleArtworkErr} alt="작품과 같이 찍기" />
                </button>

                <button onClick={() => pick("전시 테마로 같이 찍기")} aria-label="전시 테마로 같이 찍기">
                    <img src={withThemeSrc} onError={handleThemeErr} alt="전시 테마로 같이 찍기" />
                </button>
            </div>
        </div>
    );
}
