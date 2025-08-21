// src/ThemeSelect.jsx
export default function ThemeSelect({ onSelectArt }) {
    const pick = (kind) => {
        if (kind === "작품과 같이 찍기") {
            onSelectArt();
        } else {
            alert(`${kind} 선택! (여기서 다음 단계로 이동 처리)`);
        }
    };

    return (
        <div className="theme-select-container">
            <h2 className="page-title">원하는 테마를 선택해주세요!</h2>
            <div className="theme-select-body">
                <button onClick={() => pick("작품과 같이 찍기")}>
                    <img src="/images/with-picture.png" alt="작품과 같이 찍기" />
                </button>
                <button onClick={() => pick("전시 테마로 같이 찍기")}>
                    <img src="/images/with-theme.png" alt="전시 테마로 같이 찍기" />
                </button>
            </div>
        </div>
    );
}