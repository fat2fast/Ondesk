# Docker Deployment cho OnDesk

## Các file đã tạo

### 1. **Dockerfile** (Multi-stage build)

- **Stage 1 (Builder)**: Sử dụng Node.js 18 Alpine để build ứng dụng React
  - Copy dependencies và source code
  - Chạy `npm install` và `npm run build`
  - Tạo ra thư mục `dist` chứa static files
- **Stage 2 (Production)**: Sử dụng Nginx Alpine để serve ứng dụng
  - Copy nginx.conf tùy chỉnh
  - Copy static files từ builder stage
  - Expose port 80
  - Image nhẹ (~53MB)

### 2. **nginx.conf**

Cấu hình Nginx cho Single Page Application (SPA):

- ✅ **SPA Routing**: Tất cả routes đều redirect về `index.html` (tránh lỗi 404 khi reload)
- ✅ **Gzip compression**: Nén file để tăng tốc độ tải trang
- ✅ **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- ✅ **Static file caching**: Cache 1 năm cho CSS, JS, images, fonts
- ✅ **Sẵn sàng cho API proxy** (đã comment, có thể uncomment nếu cần)

### 3. **.dockerignore**

Loại trừ các file không cần thiết khỏi Docker image:

- node_modules
- Build output (dist, build)
- Environment files (.env\*)
- Git files
- IDE configs
- Documentation files

### 4. **docker-compose.yml** (đã có sẵn)

Cấu hình service:

- Image name: `ondesk-offline`
- Container name: `ondesk-app`
- Port mapping: `8080:80`
- Restart policy: `unless-stopped`

## Cách sử dụng

### Build Docker image

```bash
docker compose build
```

### Chạy container

```bash
docker compose up -d
```

### Kiểm tra trạng thái

```bash
docker compose ps
```

### Xem logs

```bash
docker compose logs -f
```

### Dừng container

```bash
docker compose down
```

### Truy cập ứng dụng

Mở trình duyệt và vào: **http://localhost:8080**

## Lưu ý

### Sửa lỗi TypeScript ✅

Tất cả các lỗi TypeScript đã được sửa! Các import không sử dụng đã được loại bỏ khỏi:

- ✅ `components/tools/CrontabExplainer.tsx` - Removed unused `CodeEditor`
- ✅ `components/tools/PasswordGenerator.tsx` - Removed unused `Button`
- ✅ `components/tools/EmailSignatureGenerator.tsx` - Removed unused `useEffect`, `MapPin`, `Linkedin`, `Twitter`, `Facebook`, `Instagram`
- ✅ `components/Sidebar.tsx` - Removed unused `Menu`
- ✅ `components/tools/UrlConverter.tsx` - Removed unused `ArrowRightLeft`
- ✅ `components/tools/TextDiff.tsx` - Removed unused `ArrowRightLeft`, `Spline`, `DiffChar`

Build TypeScript hoạt động hoàn hảo với `noUnusedLocals` và `noUnusedParameters` được bật.

### Kích thước Image

- Image size: ~53MB (rất nhẹ nhờ Alpine Linux và multi-stage build)
- Production-ready với Nginx

### Performance

- Gzip compression được bật
- Static files được cache 1 năm
- Nginx serve files rất nhanh

## Cấu trúc Image

```
ondesk-offline:latest (53.1MB)
├── Stage 1: node:18-alpine (Builder) - Dropped after build
│   └── Build React app → /app/dist
└── Stage 2: nginx:alpine (Final)
    ├── /etc/nginx/conf.d/default.conf (Custom nginx.conf)
    └── /usr/share/nginx/html (Built app from stage 1)
```

## Troubleshooting

### Port đã được sử dụng

Nếu port 8080 đã được sử dụng, sửa trong `docker-compose.yml`:

```yaml
ports:
  - "8888:80" # Thay 8080 bằng port khác
```

### Container không start

```bash
docker compose logs ondesk
```

### Rebuild từ đầu (không dùng cache)

```bash
docker compose build --no-cache
```
