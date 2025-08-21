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
 * 찍은 사진 데이터를 실제 서버로 전송하는 함수
 * @param {string} dataUrl - 캔버스에서 생성된 base64 이미지 데이터
 * @returns {Promise<string>} - 서버에 저장된 이미지의 URL
 */
const uploadImageToServer = async (dataUrl) => {
  try {
    const response = await fetch('https://kiosk-server-j2ow.onrender.com/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl }),
    });
    if (!response.ok) throw new Error('서버 응답이 올바르지 않습니다.');
    const data = await response.json();
    console.log("서버로부터 받은 URL:", data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error("이미지 업로드 중 오류 발생:", error);
    throw error;
  }
};

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

      case "artworkDetail":
        return (
          <Layout onHome={goToHome} onBack={goToArtworks}>
            <ArtworkDetail art={selectedArt} onConfirm={goToPhotoInstructions} />
          </Layout>
        );

      case "photoInstructions":
        return (
          <Layout onHome={goToHome} onBack={() => setScreen("artworkDetail")}>
            {/* ✅ 선택 작품 전달 + onStart로 연결 */}
            <PhotoInstructions
              art={selectedArt}
              onStart={goToPhotoShoot}
            />
          </Layout>
        );

      case "photo":
        return (
          <Layout onHome={goToHome} onBack={goToPhotoInstructions}>
            <PhotoShoot art={selectedArt} onCapture={handlePhotoCapture} />
          </Layout>
        );

      case "review":
        return (
          <Layout onHome={goToHome} onBack={goToPhotoShoot}>
            <Review
              capturedImage={capturedImage}
              onSave={handlePhotoConfirm}
              onRetake={goToPhotoShoot}
            />
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
