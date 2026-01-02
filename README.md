# OnDesk - Offline Developer Tools

[Tiếng Việt](#tiếng-việt) | [English](#english)

---

## Tiếng Việt

OnDesk là một bộ công cụ dành cho lập trình viên, được thiết kế để chạy 100% offline ngay trong trình duyệt của bạn. Toàn bộ dữ liệu của bạn sẽ không bao giờ rời khỏi thiết bị, đảm bảo tính riêng tư tuyệt đối.

### ✨ Tính năng nổi bật

- **100% Offline**: Mọi quá trình xử lý và logic đều diễn ra tại phía người dùng (client-side).
- **Quyền riêng tư hàng đầu**: Thiết kế an toàn, đảm bảo các dữ liệu nhạy cảm (JWT, mật khẩu, v.v.) luôn ở lại máy cục bộ.
- **Giao diện hiện đại**: Hỗ trợ Dark Mode, thiết kế Responsive phù hợp cho cả máy tính và điện thoại.
- **Tìm kiếm nhanh chóng**: Tìm công cụ bạn cần trong tích tắc với thanh tìm kiếm tích hợp.
- **Tốc độ tối ưu**: Xây dựng trên nền tảng Vite + React cho hiệu năng cực cao.

### 🛠️ Các công cụ hiện có

- **Tạo chữ ký Email**: Tạo chữ ký HTML chuyên nghiệp cho email.
- **Giải mã JWT**: Giải mã và kiểm tra token JWT mà không cần gửi lên server.
- **Giải thích Crontab**: Diễn giải các biểu thức cron thành ngôn ngữ tự nhiên dễ hiểu.
- **Làm đẹp Nginx**: Định dạng và làm sạch các file cấu hình Nginx.
- **Chỉnh sửa JSON**: Kiểm tra, định dạng và chỉnh sửa dữ liệu JSON trực quan.
- **So sánh văn bản (Diff)**: So sánh hai đoạn văn bản để tìm ra sự khác biệt.
- **Chuyển đổi Base64**: Mã hóa và giải mã chuỗi Base64 nhanh chóng.
- **Mã hóa URL**: Mã hóa và giải mã các tham số URL.
- **Tạo mật khẩu**: Tạo mật khẩu ngẫu nhiên, bảo mật cao với nhiều tùy chọn.
- **Bộ chuyển đổi đa năng**: Chuyển đổi qua lại giữa các định dạng JSON, XML, YAML, CSV và ENV.
- **Tạo mã Hash**: Hỗ trợ tạo mã MD5, SHA-1, SHA-256, SHA-512 từ văn bản hoặc file.
- **Chuyển đổi Thời gian**: Chuyển đổi qua lại giữa Epoch timestamp và thời gian thực tế.
- **Tạo UUID/GUID**: Tạo nhanh các phiên bản UUID (v1, v4, v7).

### 🚀 Chạy cục bộ (Development)

**Yêu cầu:** Đã cài đặt Node.js

1. Cài đặt các gói phụ thuộc:

   ```bash
   npm install
   ```

2. Chạy ứng dụng ở chế độ phát triển:
   ```bash
   npm run dev
   ```

### 🐳 Sử dụng với Docker

OnDesk hỗ trợ Docker để bạn có thể dễ dàng triển khai trên server riêng hoặc máy cục bộ.

#### 1. Sử dụng Docker CLI (Thủ công)

**Xây dựng Image:**

```bash
docker build -t ondesk-app .
```

**Chạy Container:**

```bash
docker run -d -p 8080:80 --name ondesk ondesk-app
```

_Sau đó truy cập qua: `http://localhost:8080`_

#### 2. Sử dụng Docker Compose (Khuyên dùng)

**Khởi động:**

```bash
docker-compose up -d
```

### 🐞 Báo lỗi (Issues)

Nếu bạn gặp vấn đề hoặc có yêu cầu tính năng mới, vui lòng tạo issue tại:
[https://github.com/fat2fast/Ondesk/issues](https://github.com/fat2fast/Ondesk/issues)

---

## English

OnDesk is a suite of developer tools designed to run 100% offline in your browser. Your data never leaves your device, ensuring maximum privacy.

### ✨ Key Features

- **100% Offline**: All transformations and logic happen client-side.
- **Privacy First**: Secure by design, ensuring sensitive data (JWTs, passwords, etc.) stays local.
- **Modern Interface**: Supports Dark Mode, responsive design for desktop and mobile.
- **Searchable**: Quickly find the tool you need with the built-in search.
- **Blazing Fast**: Built with Vite + React for high performance.

### 🛠️ Available Tools

- **Email Signature**: Generate professional HTML email signatures.
- **JWT Debugger**: Decode and verify JWTs without sending them to a server.
- **Crontab Explainer**: Parse and explain cron expressions in plain English.
- **Nginx Beautifier**: Format and clean up Nginx configuration files.
- **JSON Editor**: Validate, format, and edit JSON data.
- **Text Diff**: Compare two text blocks to find differences.
- **Base64 Converter**: Encode and decode Base64 strings.
- **URL Encoder**: Encode and decode URLs.
- **Password Generator**: Create secure, random passwords.
- **Universal Converter**: Convert between various formats like JSON, XML, YAML, CSV, and ENV.
- **Hash Generator**: Support MD5, SHA-1, SHA-256, SHA-512 for text or files.
- **Time Converter**: Convert between Epoch timestamps and human-readable dates.
- **UUID/GUID Generator**: Fast generation of UUID versions (v1, v4, v7).

### 🚀 Run Locally (Development)

**Prerequisites:** Node.js installed

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

### 🐳 Docker Usage

OnDesk supports Docker for easy deployment on your own server or local machine.

#### 1. Docker CLI (Manual)

**Build Image:**

```bash
docker build -t ondesk-app .
```

**Run Container:**

```bash
docker run -d -p 8080:80 --name ondesk ondesk-app
```

_Access via: `http://localhost:8080`_

#### 2. Docker Compose (Recommended)

**Start:**

```bash
docker-compose up -d
```

### 🐞 Bug Reports (Issues)

If you encounter any issues or have feature requests, please open an issue at:
[https://github.com/fat2fast/Ondesk/issues](https://github.com/fat2fast/Ondesk/issues)

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
