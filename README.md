# 🆔 ID Card Generator

Ứng dụng tạo ID card với thông tin ngẫu nhiên, sử dụng GitHub Pages cho frontend và Vercel cho backend API.

## ✨ Tính năng

-   🎲 Tạo ID card với thông tin ngẫu nhiên
-   👤 Avatar người thật từ AI
-   📱 Giao diện responsive và đẹp mắt
-   ⏰ Rate limiting (30 giây giữa các request)
-   📥 Tải xuống ảnh ID card
-   🏷️ Barcode tự động

## 🚀 Cách triển khai

### Bước 1: Chuẩn bị Repository

1. Tạo repository mới trên GitHub
2. Clone repository về máy local:

```bash
git clone https://github.com/your-username/id-card-generator.git
cd id-card-generator
```

### Bước 2: Deploy Backend lên Vercel

1. **Đăng ký tài khoản Vercel** tại [vercel.com](https://vercel.com)

2. **Cài đặt Vercel CLI**:

```bash
npm install -g vercel
```

3. **Đăng nhập Vercel**:

```bash
vercel login
```

4. **Deploy backend**:

```bash
vercel --prod
```

5. **Lưu URL API** được trả về (ví dụ: `https://your-project.vercel.app`)

### Bước 3: Cập nhật Frontend

1. **Cập nhật URL API** trong file `index.html`:

```javascript
// Thay đổi dòng này trong index.html
const response = await fetch('https://your-project.vercel.app/api/create-id-card', {
```

2. **Commit và push code**:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Bước 4: Cấu hình GitHub Pages

1. Vào repository trên GitHub
2. Vào **Settings** → **Pages**
3. Chọn **Source**: "Deploy from a branch"
4. Chọn **Branch**: "main"
5. Chọn **Folder**: "/ (root)"
6. Click **Save**

### Bước 5: Kiểm tra

-   Frontend sẽ có sẵn tại: `https://your-username.github.io/id-card-generator`
-   Backend API sẽ có sẵn tại: `https://your-project.vercel.app/api/create-id-card`

## 📁 Cấu trúc Project

```
id-card-generator/
├── index.html              # Frontend (GitHub Pages)
├── api/
│   └── create-id-card.js   # Backend API (Vercel)
├── bg2.png                 # Background image
├── temp_fonts/             # Font files
├── package.json
├── vercel.json             # Vercel config
└── README.md
```

## 🔧 Cấu hình

### Rate Limiting

-   Thời gian chờ giữa các request: 30 giây
-   Có thể thay đổi trong file `index.html`:

```javascript
const COOLDOWN_TIME = 30000 // 30 giây
```

### API Endpoints

-   `GET /api/create-id-card`: Tạo ID card mới
-   Response: JSON với `imageUrl` (base64 data URL)

## 🛠️ Development

### Chạy local

```bash
# Cài đặt dependencies
npm install

# Chạy backend local
npm run dev

# Frontend: Mở index.html trong browser
```

### Cấu trúc API Response

```json
{
    "success": true,
    "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "message": "ID card đã được tạo thành công"
}
```

## 🎨 Tùy chỉnh

### Thay đổi Background

-   Thay thế file `bg2.png` với ảnh background mới
-   Đảm bảo kích thước phù hợp (khuyến nghị: 800x600px)

### Thay đổi Font

-   Thay thế files trong thư mục `temp_fonts/`
-   Cập nhật đường dẫn trong `api/create-id-card.js`

### Thay đổi Layout

-   Chỉnh sửa tọa độ text trong hàm `generateCard()`
-   Điều chỉnh vị trí avatar và barcode

## 🔒 Bảo mật

-   Rate limiting ngăn chặn spam
-   CORS được cấu hình cho cross-origin requests
-   Không lưu trữ dữ liệu cá nhân

## 📝 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.
