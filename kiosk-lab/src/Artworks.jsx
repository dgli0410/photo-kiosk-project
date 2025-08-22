// src/Artworks.jsx
import { useState } from "react";
import { useTheme } from "./ThemeProvider.jsx"; // ✅ 모드 확인
import InstitutionModal from "./InstitutionModal";

const artworksData = [
    { id: 1, title: "<마음에 핀 꽃>", artist: "김영희", institution: "서울시립북부장애인종합복지관", imgSrc: "/images/art_example1.svg" },
    { id: 2, title: "<햇살 머문 오후>", artist: "김영희", institution: "노원발달장애인평생교육센터", imgSrc: "/images/art-sample-2.jpg" },
    { id: 3, title: "<꽃병>", artist: "이하나", institution: "서울시립뇌성마비복지관", imgSrc: "/images/art-sample-3.jpg" },
    { id: 4, title: "<도시와 달>", artist: "박지민", institution: "평화종합사회복지관", imgSrc: "/images/art-sample-4.jpg" },
    { id: 5, title: "<추가될 작품>", artist: "미정", institution: "서울시립뇌성마비복지관", imgSrc: "" },
    { id: 6, title: "<추가될 작품 2>", artist: "미정", institution: "노원발달장애인평생교육센터", imgSrc: null },
];

const uniqueInstitutions = ["전체", ...new Set(artworksData.map((art) => art.institution).filter(Boolean))];

function ArtworkCard({ art, onSelect }) {
    return (
        <div className="artwork-card-container" onClick={() => onSelect(art)}>
            {/* 1. 배경 레이어: 작품 이미지 */}
            <div className="artwork-image-background">
                {art.imgSrc && <img src={art.imgSrc} alt={art.title} />}
            </div>

            {/* 2. 전경 레이어: 구멍 뚫린 흰색 카드 */}
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
    const { mode } = useTheme();          // ✅ 현재 모드
    const isHC = mode === "hc";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("전체");

    const handleFilterSelect = (institution) => {
        setActiveFilter(institution);
        setIsModalOpen(false);
    };

    const filteredArtworks =
        activeFilter === "전체" ? artworksData : artworksData.filter((art) => art.institution === activeFilter);

    // ✅ 고대비 전용 "기관으로 찾기" 아이콘 경로
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
                            onError={(e) => (e.currentTarget.src = "/images/find-agency.png")} // ✅ 파일 없을 때 기본으로
                        />
                    ) : (
                        <div className="filtered-agency-btn">
                            {/* <img src="/images/icon-search.svg" alt="검색" /> */}
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
                    institutions={uniqueInstitutions}
                    currentFilter={activeFilter}
                    onClose={() => setIsModalOpen(false)}
                    onComplete={handleFilterSelect}
                />
            )}
        </div>
    );
}
