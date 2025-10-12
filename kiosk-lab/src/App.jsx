// src/App.jsx
import "./index.css";
import "./styles.css";
import { useState } from "react";
import KioskMain from "./KioskMain.jsx";
import ThemeSelect from "./ThemeSelect.jsx";
import Artworks from "./Artworks.jsx";
import ArtworkDetail from "./ArtworkDetail.jsx";
import PhotoInstructions from "./PhotoInstructions.jsx";
import PhotoShoot from "./PhotoShoot.jsx";
import Review from "./Review.jsx";
import QrCode from "./QrCode.jsx";
import Layout from "./Layout.jsx";
import { useTheme } from "./ThemeProvider.jsx"; // ✅ 모드 컨텍스트

/**
 * 찍은 사진 데이터를 실제 서버로 전송하는 함수
 */
const uploadImageToServer = async (dataUrl) => {
  try {
    const response = await fetch("https://kiosk-server-j2ow.onrender.com/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
    });
    if (!response.ok) throw new Error("서버 응답이 올바르지 않습니다.");
    const data = await response.json();
    console.log("서버로부터 받은 URL:", data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error("이미지 업로드 중 오류 발생:", error);
    throw error;
  }
};

export default function App() {
  const { mode, setMode } = useTheme();         // ✅ 현재 모드 + setter
  const [screen, setScreen] = useState("home");
  const [selectedArt, setSelectedArt] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [finalImageUrl, setFinalImageUrl] = useState(null);

  const goToThemeSelect = () => setScreen("theme");
  const goToArtworks = () => setScreen("artworks");
  const goToHome = () => {
    setScreen("home");
    setSelectedArt(null);
    setCapturedImage(null);
    setFinalImageUrl(null);
  };

  // ✅ 모드 전환 콜백
  const toHighContrast = () => {
    setMode("hc");       // 고대비
    setScreen("home");   // 즉시 기본 플로우의 메인(홈)으로
  };
  const toNormalMode = () => {
    setMode("normal");   // 일반
    setScreen("home");   // 즉시 기본 메인(홈)으로
  };
  const toLowMode = () => {
    setMode("low");      // 낮은 화면
    setScreen("home");
  };

  const handleArtSelect = (art) => {
    setSelectedArt(art);
    setScreen("artworkDetail");
  };
  const goToPhotoInstructions = () => setScreen("photoInstructions");
  const goToPhotoShoot = () => setScreen("photo");

  const handlePhotoCapture = (imageData) => {
    setCapturedImage(imageData);
    setScreen("review");
  };

  const handlePhotoConfirm = async () => {
    if (!capturedImage) return;
    const url = await uploadImageToServer(capturedImage);
    setFinalImageUrl(url);
    setScreen("qr");
  };

  // ✅ 추가: “전시 테마로 같이 찍기” → 바로 촬영 화면 진입 (배경: theme-post.png)
  const startThemeShoot = () => {
    setSelectedArt({
      id: "THEME",
      title: "전시 테마",
      imgSrc: "/images/theme-post.png", // public/images/theme-post.png 에 파일 배치
      description: "전시 테마 배경으로 함께 촬영합니다.",
      institution: "테마",
      artist: "",
    });
    setScreen("photo"); // 미리보기 없이 곧바로 촬영 화면
  };

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return <KioskMain onStart={goToThemeSelect} />;

      case "theme":
        return (
          <Layout
            onHome={goToHome}
            onBack={goToHome}
            mode={mode}
            onSwitchToHC={toHighContrast}
            onSwitchToNormal={toNormalMode}
            onSwitchToLow={toLowMode}
          >
            {/* 전시 테마 버튼을 누르면 바로 촬영 진입 */}
            <ThemeSelect onSelectArt={goToArtworks} onSelectTheme={startThemeShoot} />
          </Layout>
        );

      case "artworks":
        return (
          <Layout
            onHome={goToHome}
            onBack={goToThemeSelect}
            mode={mode}
            onSwitchToHC={toHighContrast}
            onSwitchToNormal={toNormalMode}
            onSwitchToLow={toLowMode}
          >
            <Artworks onSelect={handleArtSelect} />
          </Layout>
        );

      case "artworkDetail":
        return (
          <Layout
            onHome={goToHome}
            onBack={goToArtworks}
            mode={mode}
            onSwitchToHC={toHighContrast}
            onSwitchToNormal={toNormalMode}
            onSwitchToLow={toLowMode}
          >
            <ArtworkDetail
              art={selectedArt}
              onConfirm={goToPhotoInstructions}
              onCancel={() => setScreen("artworks")}
            />
          </Layout>
        );

      // App.jsx (발췌)
      case "photoInstructions":
        return (
          <Layout
            onHome={goToHome}
            onBack={() => setScreen("artworkDetail")} // ← 푸터의 '이전'은 여전히 상세로
            mode={mode}
            onSwitchToHC={toHighContrast}
            onSwitchToNormal={toNormalMode}
          >
            <PhotoInstructions
              art={selectedArt}
              onBack={() => setScreen("artworks")}     // ★ '다시 선택'은 작품 목록으로
              onStart={goToPhotoShoot}  // 촬영 시작은 촬영 화면으로
            />
          </Layout>
        );


      case "photo":
        return (
          <Layout
            onHome={goToHome}
            onBack={() => setScreen(selectedArt?.id === "THEME" ? "theme" : "photoInstructions")}
            mode={mode}
            onSwitchToHC={toHighContrast}
            onSwitchToNormal={toNormalMode}
            onSwitchToLow={toLowMode}
          >
            {/* 낮은화면 모드 예외: 촬영부터 여백 제거 */}
            <div className="no-low-shift">
              <PhotoShoot
                art={selectedArt}
                onCapture={handlePhotoCapture}
                onBack={() => setScreen(selectedArt?.id === "THEME" ? "theme" : "artworkDetail")}
              />
            </div>
          </Layout>
        );

      case "review":
        return (
          <Layout
            onHome={goToHome}
            onBack={goToPhotoShoot}
            mode={mode}
            onSwitchToHC={toHighContrast}
            onSwitchToNormal={toNormalMode}
            onSwitchToLow={toLowMode}
          >
            {/* 낮은화면 모드 예외: 리뷰 화면도 여백 제거 */}
            <div className="no-low-shift">
              <Review
                capturedImage={capturedImage}
                onSave={handlePhotoConfirm}
                onRetake={goToPhotoShoot}
              />
            </div>
          </Layout>
        );

      case "qr":
        return (
          <Layout
            onHome={goToHome}
            onBack={() => setScreen("review")}
            mode={mode}
            onSwitchToHC={toHighContrast}
            onSwitchToNormal={toNormalMode}
            onSwitchToLow={toLowMode}
          >
            {/* 낮은화면 모드 예외: QR 화면도 여백 제거 */}
            <div className="no-low-shift">
              <QrCode imageUrl={finalImageUrl} onDone={goToHome} />
            </div>
          </Layout>
        );

      default:
        return <KioskMain onStart={goToThemeSelect} />;
    }
  };

  return <>{renderScreen()}</>;
}
