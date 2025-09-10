// src/Artworks.jsx
import { useState } from "react";
import { useTheme } from "./ThemeProvider.jsx";
import InstitutionModal from "./InstitutionModal";
import artworksData from "./data/artworks.js";

// ✅ “기관으로 찾기” 모달에 표시될 고정 목록 (요청한 순서 그대로)
const INSTITUTIONS = [
    "전체",
    "서울장애인부모연대 노원지회",
    "노원발달장애인평생교육센터",
    "다운복지관",
    "서울시립뇌성마비복지관",
    "서울시립북부장애인종합복지관",
    "서울시립상이군경복지관",
];

function ArtworkCard({ art, onSelect }) {
    return (
        <div className="artwork-card-container" onClick={() => onSelect(art)}>
            {/* 1) 배경 레이어: 작품 이미지 */}
            <div className="artwork-image-background">
                <div className="artwork-image-window">
                    {art.imgSrc && <img src={art.imgSrc} alt={art.title} />}
                </div>
            </div>

            {/* 2) 전경 레이어: 구멍 카드 + 텍스트 */}
            <div className="artwork-card-overlay">
                <div className="card-hole">
                    <span className="card-badge">전시</span>
                </div>
                <div className="card-info">
                    <h3>{art.title}</h3>
                    <p>{art.artist}</p>
                    <p className="institution">{art.institution}</p>
                </div>
            </div>
        </div>
    );
}

export default function Artworks({ onSelect }) {
    const { mode } = useTheme();
    const isHC = mode === "hc";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("전체");

    const handleFilterSelect = (institution) => {
        setActiveFilter(institution);
        setIsModalOpen(false);
    };

    // 외부 데이터(artworksData)로 필터 그대로 동작
    const filteredArtworks =
        activeFilter === "전체"
            ? artworksData
            : artworksData.filter((art) => art.institution === activeFilter);

    // 고대비 전용 "기관으로 찾기" 아이콘 경로
    const findAgencySrc = isHC ? "/images/hc/find-agency-hc.svg" : "/images/find-agency.png";

    return (
        <div className="artworks-container">
            <div className="artworks-header">
                <h2 className="page-title font-cafe24">작품을 선택해주세요</h2>

                <button onClick={() => setIsModalOpen(true)} className="find-agency-btn">
                    {activeFilter === "전체" ? (
                        <img
                            src={findAgencySrc}
                            alt="기관으로 찾기"
                            onError={(e) => (e.currentTarget.src = "/images/find-agency.png")}
                        />
                    ) : (
                        <div className="filtered-agency-btn">
                            <span>{activeFilter}</span>
                        </div>
                    )}
                </button>
            </div>

            <div className="artworks-grid-container">
                <div className="artworks-grid">
                    {filteredArtworks.map((art) => (
                        <ArtworkCard key={art.id} art={art} onSelect={onSelect} />
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <InstitutionModal
                    institutions={INSTITUTIONS}
                    currentFilter={activeFilter}
                    onClose={() => setIsModalOpen(false)}
                    onComplete={handleFilterSelect}
                />
            )}
        </div>
    );
}
