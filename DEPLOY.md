# 🚀 Hướng dẫn Deploy Nhanh

## 📋 Checklist trước khi deploy

-   [ ] Có tài khoản GitHub
-   [ ] Có tài khoản Vercel (đăng ký tại vercel.com)
-   [ ] Đã cài đặt Node.js (version 18+)
-   [ ] Đã cài đặt Git

## ⚡ Deploy trong 5 phút

### 1. Tạo Repository GitHub

```bash
# Tạo repository mới trên GitHub
# Clone về máy local
git clone https://github.com/your-username/id-card-generator.git
cd id-card-generator
```

### 2. Deploy Backend lên Vercel

```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Đăng nhập Vercel
vercel login

# Deploy
vercel --prod

# Lưu URL được trả về (ví dụ: https://my-project.vercel.app)
```

### 3. Cập nhật Frontend

```bash
# Cập nhật URL API
node update-api-url.js https://my-project.vercel.app

# Commit và push
git add .
git commit -m "Update API URL"
git push origin main
```

### 4. Cấu hình GitHub Pages

1. Vào repository trên GitHub
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: "main"
5. Folder: "/ (root)"
6. Save

### 5. Kiểm tra

-   Frontend: `https://your-username.github.io/id-card-generator`
-   Backend: `https://my-project.vercel.app/api/create-id-card`

## 🔧 Troubleshooting

### Lỗi "Module not found"

```bash
# Cài đặt dependencies
npm install
```

### Lỗi "Font not found"

-   Đảm bảo thư mục `temp_fonts/` có đầy đủ files
-   Kiểm tra đường dẫn trong `api/create-id-card.js`

### Lỗi "Background image not found"

-   Đảm bảo file `bg2.png` tồn tại
-   Kiểm tra đường dẫn trong `api/create-id-card.js`

### Lỗi CORS

-   Backend đã có CORS headers
-   Kiểm tra URL API trong `index.html`

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra console trong browser
2. Kiểm tra logs trong Vercel dashboard
3. Tạo issue trên GitHub repository
