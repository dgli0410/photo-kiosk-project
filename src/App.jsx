// src/App.jsx
import "./index.css";
import "./styles.css";
import { useState } from "react";
import KioskMain from "./KioskMain.jsx";
import ThemeSelect from "./ThemeSelect.jsx";
import Artworks from "./Artworks.jsx";
import ArtworkDetail from "./ArtworkDetail.jsx"; // 신규 import
import PhotoInstructions from "./PhotoInstructions.jsx"; // 신규 import
import PhotoShoot from "./PhotoShoot.jsx";
import Review from "./Review.jsx";
import QrCode from "./QrCode.jsx";
import Layout from "./Layout.jsx";

/**
 * 이미지를 서버에 업로드하는 것을 시뮬레이션하는 임시 함수
 * @param {string} dataUrl - 캔버스에서 생성된 base64 이미지 데이터
 * @returns {Promise<string>} - 업로드된 이미지의 가짜 URL
 */
const uploadImageToServer = async (dataUrl) => {
  console.log("서버에 이미지 업로드 시도:", dataUrl.substring(0, 50) + "...");

  // 1초간 업로드하는 척 기다립니다.
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 실제로는 서버가 없으므로, 성공했다고 가정하고 가짜 URL을 반환합니다.
  const fakeImageUrl = `https://your-server.com/images/${Date.now()}.jpg`;
  console.log("업로드 성공! 가짜 URL:", fakeImageUrl);

  return fakeImageUrl;
};
// ... (uploadImageToServer 함수는 기존과 동일)

export default function App() {
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

  // 작품 선택 시 -> 작품 '상세' 화면으로 이동
  const handleArtSelect = (art) => {
    setSelectedArt(art);
    setScreen("artworkDetail");
  };

  // 작품 상세 화면에서 '사진찍기' 선택 시 -> 촬영 '안내' 화면으로 이동
  const goToPhotoInstructions = () => setScreen("photoInstructions");

  // 촬영 안내 화면에서 '촬영하기' 선택 시 -> 실제 '촬영' 화면으로 이동
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
      // --- Layout 사용하는 페이지들 ---
      case "theme":
        return (
          <Layout onHome={goToHome} onBack={goToHome}>
            <ThemeSelect onSelectArt={goToArtworks} />
          </Layout>
        );
      case "artworks":
        return (
          <Layout onHome={goToHome} onBack={goToThemeSelect}>
            <Artworks onSelect={handleArtSelect} />
          </Layout>
        );
      // --- 신규 페이지 렌더링 로직 추가 ---
      case "artworkDetail":
        return (
          <Layout onHome={goToHome} onBack={goToArtworks}>
            <ArtworkDetail art={selectedArt} onConfirm={goToPhotoInstructions} />
          </Layout>
        );
      case "photoInstructions":
        return (
          <Layout onHome={goToHome} onBack={() => setScreen("artworkDetail")}>
            <PhotoInstructions onConfirm={goToPhotoShoot} />
          </Layout>
        );
      // --- 기존 페이지 렌더링 로직 ---
      case "photo":
        return (
          <Layout onHome={goToHome} onBack={goToPhotoInstructions}>
            <PhotoShoot art={selectedArt} onCapture={handlePhotoCapture} />
          </Layout>
        );
      case "review":
        return (
          <Layout onHome={goToHome} onBack={goToPhotoShoot}>
            <Review capturedImage={capturedImage} onSave={handlePhotoConfirm} onRetake={goToPhotoShoot} />
          </Layout>
        );
      case "qr":
        return (
          <Layout onHome={goToHome} onBack={() => setScreen("review")}>
            <QrCode imageUrl={finalImageUrl} onDone={goToHome} />
          </Layout>
        );
      default:
        return <KioskMain onStart={goToThemeSelect} />;
    }
  };

  return <>{renderScreen()}</>;
}