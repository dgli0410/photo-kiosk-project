// server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs'); // 파일 시스템을 다루는 Node.js 기본 모듈
const path = require('path'); // 파일 경로를 다루는 Node.js 기본 모듈

const app = express();
const PORT = 3001; // 서버가 실행될 포트 번호 (React 앱과 겹치지 않게)

// --- 미들웨어 설정 ---

// 1. CORS 설정: 모든 도메인에서의 요청을 허용합니다.
app.use(cors());

// 2. JSON 요청 본문 파싱 설정: base64 이미지 데이터는 용량이 크므로 제한을 50mb로 늘립니다.
app.use(express.json({ limit: '50mb' }));

// 3. 'uploads' 폴더를 정적 파일 경로로 설정:
// 이렇게 하면 http://localhost:3001/images/파일명.jpg 로 이미지에 접근할 수 있습니다.
app.use('/images', express.static('uploads'));

// --- 서버 로직 ---

// 'uploads' 폴더가 없으면 생성합니다.
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// '/upload' 경로로 POST 요청이 왔을 때 처리할 API 엔드포인트
app.post('/upload', (req, res) => {
    // 1. React 앱에서 보낸 base64 이미지 데이터를 받습니다.
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: '이미지 데이터가 없습니다.' });
    }

    // 2. base64 데이터의 앞부분('data:image/jpeg;base64,')을 제거합니다.
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");

    // 3. 고유한 파일 이름을 생성합니다. (현재 시간 + .jpeg)
    const filename = `${Date.now()}.jpeg`;
    const filePath = path.join(uploadsDir, filename);

    // 4. base64 데이터를 파일로 변환하여 'uploads' 폴더에 저장합니다.
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('파일 저장 오류:', err);
            return res.status(500).json({ error: '파일 저장 중 오류가 발생했습니다.' });
        }

        // 5. 저장이 성공하면, 클라이언트가 접근할 수 있는 이미지 URL을 응답으로 보냅니다.
        const imageUrl = `https://kiosk-server-j2ow.onrender.com/images/${filename}`;
        console.log('파일 저장 성공:', imageUrl);
        res.status(200).json({ imageUrl: imageUrl });
    });
});

// 지정된 포트에서 서버를 실행합니다.
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});