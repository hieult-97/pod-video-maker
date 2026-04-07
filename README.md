# POD Video Maker

Tạo video TikTok cho sản phẩm POD — AI gợi ý, gen ảnh, dựng video, tải về.

## SETUP (5 phút)

### Cách 1: GitHub + Vercel (giống TruyệnAI)

1. **Tạo repo mới trên GitHub**
   - github.com → New repository → tên: `pod-video-maker`

2. **Upload tất cả file**
   - Vào repo → Add file → Upload files
   - Kéo thả TẤT CẢ file và folder vào (giữ đúng cấu trúc)
   - Hoặc dùng GitHub Desktop

3. **Kết nối Vercel**
   - vercel.com → New Project → Import từ GitHub
   - Chọn repo `pod-video-maker`
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Bấm Deploy

4. **Xong!** Vercel tự cài dependencies + build + deploy.
   Có link public dạng: `pod-video-maker.vercel.app`

### Cách 2: Chạy local (nếu muốn test trước)

```bash
# Cần Node.js >= 18
npm install
npm run dev
# Mở http://localhost:5173
```

## CẤU TRÚC FILE

```
pod-video-maker/
├── index.html          ← Entry HTML
├── package.json        ← Dependencies (tất cả FREE)
├── vite.config.js      ← Vite config
├── vercel.json         ← CORS headers cho Vercel
├── README.md           ← File này
└── src/
    ├── main.jsx        ← React entry
    ├── index.css       ← Global CSS
    └── App.jsx         ← Toàn bộ app (file chính)
```

## DEPENDENCIES (TẤT CẢ FREE)

| Package | Dùng cho | Phí |
|---------|----------|-----|
| react | UI framework | FREE |
| vite | Build tool | FREE |
| @dnd-kit | Kéo thả sắp xếp scene | FREE |
| @ffmpeg | Xử lý video (tương lai) | FREE |
| tone | Audio/nhạc nền | FREE |

## AI PROVIDERS (TẤT CẢ CÓ FREE)

| Provider | Cần key? | Tạo key |
|----------|----------|---------|
| Pollinations | KHÔNG | Dùng ngay |
| Groq | Có (free) | console.groq.com |
| Gemini | Có (free) | aistudio.google.com |
| Claude | Auto trên claude.ai | — |

## TÍNH NĂNG

- 📸 Upload ảnh sản phẩm
- 🔗 Paste HTML source → AI đọc trang web
- 💡 Gõ ý tưởng → AI gen concept + trend
- 🤖 AI gen 4 ý tưởng video (viral score)
- 🎨 Pollinations gen ảnh AI cho mỗi scene
- ⠿ Kéo thả sắp xếp scene (dnd-kit)
- ↩ Undo khi xoá scene nhầm
- 🎵 Upload nhạc nền (render cùng video)
- ⏺ Render video 1080×1920 (chuẩn TikTok)
- ⬇️ Tải .webm
- 🚀 1 click copy prompt + mở InVideo/Kling/CapCut
- ⚙️ Chọn AI provider (5 lựa chọn)
