# Day 01 — Weather Dashboard (Vanilla JS)

Dự án đầu tiên trong chuỗi **14 Ngày - 14 Dự án thực chiến**.

## Công nghệ
HTML/CSS/JavaScript thuần — không framework, không build tool.

## Chức năng
- Tìm thời tiết hiện tại theo tên thành phố
- Dự báo 5 ngày tới
- Lưu thành phố yêu thích (localStorage)
- Lấy thời tiết theo vị trí hiện tại (Geolocation)
- Đổi đơn vị °C / °F
- Chi tiết: độ ẩm, tốc độ gió, áp suất, cảm giác như
- Bản đồ nhiệt độ trực quan (Leaflet + lớp phủ Temperature của OpenWeatherMap), hiển thị bubble nhiệt độ cho thành phố đang xem và các thành phố yêu thích

## Setup

1. Đăng ký tài khoản miễn phí tại https://home.openweathermap.org/users/sign_up
2. Lấy API key tại https://home.openweathermap.org/api_keys (key có thể mất 10-30 phút để kích hoạt sau khi tạo)
3. Mở file `js/config.js`, dán key vào:
   ```js
   const CONFIG = {
     API_KEY: "dán_key_của_bạn_vào_đây",
   };
   ```
4. Mở `index.html` trực tiếp bằng trình duyệt (double-click), hoặc dùng extension **Live Server** trong VS Code để có auto-reload.

## Cấu trúc thư mục
```
day-01-weather-dashboard/
├── index.html
├── css/style.css
├── js/map.js            # bản đồ Leaflet + lớp phủ nhiệt độ
├── js/
│   ├── config.js        # API key (không commit — đã gitignore)
│   ├── config.example.js
│   ├── api.js            # gọi OpenWeatherMap API
│   ├── storage.js        # localStorage (favorites, unit)
│   ├── ui.js              # render DOM
│   └── app.js             # entry point, event handling
└── README.md
```

## Ghi chú kỹ thuật
Dùng endpoint `/forecast` (miễn phí, không cần thẻ tín dụng) thay vì One Call API — dữ liệu 3 giờ/lần được gộp lại thành 1 điểm/ngày trong `api.js` (hàm `aggregateDailyForecast`), cho ra dự báo 5 ngày.
