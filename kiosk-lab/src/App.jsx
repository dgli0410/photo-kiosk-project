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

// App.jsx

/**
 * 찍은 사진 데이터를 실제 서버로 전송하는 함수
 * @param {string} dataUrl - 캔버스에서 생성된 base64 이미지 데이터
 * @returns {Promise<string>} - 서버에 저장된 이미지의 URL
 */
const uploadImageToServer = async (dataUrl) => {
  try {
    // 1. 우리 서버의 /upload 엔드포인트로 POST 요청을 보냅니다.
    const response = await fetch('https://kiosk-server-j2ow.onrender.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 2. body에 이미지 데이터를 JSON 형식으로 담아 보냅니다.
      body: JSON.stringify({ image: dataUrl }),
    });

    // 3. 응답이 성공적이지 않으면 에러를 발생시킵니다.
    if (!response.ok) {
      throw new Error('서버 응답이 올바르지 않습니다.');
    }

    // 4. 서버로부터 받은 JSON 응답에서 이미지 URL을 추출합니다.
    const data = await response.json();
    console.log("서버로부터 받은 URL:", data.imageUrl);

    // 5. 최종 URL을 반환합니다.
    return data.imageUrl;

  } catch (error) {
    console.error("이미지 업로드 중 오류 발생:", error);
    // 오류가 발생하면 QR 코드가 생성되지 않도록 null을 반환하거나,
    // 사용자에게 알림을 띄우는 등의 처리를 할 수 있습니다.
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