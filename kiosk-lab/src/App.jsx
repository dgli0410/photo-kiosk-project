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
            <ThemeSelect onSelectArt={goToArtworks} />
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

      case "photoInstructions":
        return (
          <Layout
            onHome={goToHome}
            onBack={() => setScreen("artworkDetail")}
            mode={mode}
            onSwitchToHC={toHighContrast}
            onSwitchToNormal={toNormalMode}
            onSwitchToLow={toLowMode}
          >
            <PhotoInstructions art={selectedArt} onStart={goToPhotoShoot} />
          </Layout>
        );

      case "photo":
        return (
          <Layout
            onHome={goToHome}
            onBack={goToPhotoInstructions}
            mode={mode}
            onSwitchToHC={toHighContrast}
            onSwitchToNormal={toNormalMode}
            onSwitchToLow={toLowMode}
          >
            <PhotoShoot
              art={selectedArt}
              onCapture={handlePhotoCapture}
              onBack={() => setScreen("artworkDetail")}
            />
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
            <Review
              capturedImage={capturedImage}
              onSave={handlePhotoConfirm}
              onRetake={goToPhotoShoot}
            />
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
            <QrCode imageUrl={finalImageUrl} onDone={goToHome} />
          </Layout>
        );

      default:
        return <KioskMain onStart={goToThemeSelect} />;
    }
  };

  return <>{renderScreen()}</>;
}
