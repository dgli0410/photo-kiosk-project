// src/ThemeSelect.jsx
import { useTheme } from "./ThemeProvider.jsx"; // ✅ 현재 모드 사용

export default function ThemeSelect({ onSelectArt, onSelectTheme }) {
    const { mode } = useTheme();
    const isHC = mode === "hc";

    const pick = (kind) => {
        if (kind === "작품과 같이 찍기") {
            onSelectArt();
        } else if (kind === "전시 테마로 같이 찍기") {
            onSelectTheme?.();
        } else {
            // 기타 케이스 필요 시
        }
    };

    // ✅ 모드별 버튼 이미지 경로
    const btnWithPicture = isHC ? "/images/hc/with-picture.png" : "/images/with-picture.png";
    const btnWithTheme = isHC ? "/images/hc/with-theme.png" : "/images/with-theme.png";

    return (
        <div className="theme-select-container">
            <h2 className="page-title font-cafe24">원하는 테마를 선택해주세요!</h2>

            <div className="theme-select-body">
                <button onClick={() => pick("작품과 같이 찍기")}>
                    <img
                        src={btnWithPicture}
                        onError={(e) => (e.currentTarget.src = "/images/with-picture.png")}
                        alt="작품과 같이 찍기"
                    />
                </button>

                <button onClick={() => pick("전시 테마로 같이 찍기")}>
                    <img
                        src={btnWithTheme}
                        onError={(e) => (e.currentTarget.src = "/images/with-theme.png")}
                        alt="전시 테마로 같이 찍기"
                    />
                </button>
            </div>
        </div>
    );
}
