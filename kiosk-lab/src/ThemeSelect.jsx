// src/ThemeSelect.jsx
import { useTheme } from "./ThemeProvider.jsx"; // ✅ 현재 모드 사용

export default function ThemeSelect({ onSelectArt }) {
    const { mode } = useTheme();
    const isHC = mode === "hc";

    const pick = (kind) => {
        if (kind === "작품과 같이 찍기") {
            onSelectArt();
        } else {
            alert(`${kind} 선택! (여기서 다음 단계로 이동 처리)`);
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
