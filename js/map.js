/**
 * map.js — Bản đồ nhiệt độ (Leaflet + lớp phủ Temperature của OpenWeatherMap)
 */

const WeatherMap = {
  map: null,
  tempLayer: null,
  markers: {}, // key: tên thành phố -> L.marker
  _tileErrorCount: 0,

  init() {
    this.map = L.map("weather-map", {
      scrollWheelZoom: false,
    }).setView([22, 100], 4); // mặc định: zoom rộng để thấy tương phản màu nhiệt độ Bắc - Nam Á

    // OpenStreetMap chuẩn — miễn phí, không cần API key (khác CARTO, giờ yêu cầu key riêng)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 12,
    }).addTo(this.map);

    this.tempLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${CONFIG.API_KEY}`,
      { opacity: 0.75, maxZoom: 12 }
    );
    this.tempLayer.addTo(this.map);

    // Phát hiện nếu lớp nhiệt độ không tải được (key chưa kích hoạt cho Weather Maps,
    // hoặc lỗi mạng) để báo rõ cho người dùng thay vì im lặng hiển thị bản đồ trắng.
    this.tempLayer.on("tileerror", () => {
      this._tileErrorCount++;
      if (this._tileErrorCount === 3) {
        UI.showStatus(
          "Lớp màu nhiệt độ trên bản đồ chưa tải được. API key của OpenWeatherMap có thể cần thêm thời gian để kích hoạt tính năng Weather Maps (thường lâu hơn tính năng thời tiết thường vài chục phút - vài giờ). Bạn có thể thử lại sau.",
          "error"
        );
      }
    });
    this.tempLayer.on("tileload", () => {
      this._tileErrorCount = 0;
    });
  },

  _tempBubbleIcon(tempRounded, unit, highlighted) {
    const sym = unit === "imperial" ? "°F" : "°C";
    return L.divIcon({
      className: "",
      html: `<div class="map-temp-bubble ${highlighted ? "highlighted" : ""}">${tempRounded}${sym}</div>`,
      iconSize: null,
    });
  },

  /**
   * Vẽ/ cập nhật marker nhiệt độ cho 1 thành phố.
   * highlighted = true cho thành phố đang xem chính (bubble to, nổi bật hơn)
   */
  setCityMarker(cityKey, { lat, lon, temp, unit, label, highlighted = false }) {
    const icon = this._tempBubbleIcon(Math.round(temp), unit, highlighted);

    if (this.markers[cityKey]) {
      this.markers[cityKey].setLatLng([lat, lon]).setIcon(icon);
    } else {
      this.markers[cityKey] = L.marker([lat, lon], { icon }).addTo(this.map);
    }
    this.markers[cityKey].bindTooltip(label || cityKey, { direction: "top" });
  },

  removeCityMarker(cityKey) {
    if (this.markers[cityKey]) {
      this.map.removeLayer(this.markers[cityKey]);
      delete this.markers[cityKey];
    }
  },

  focusOn(lat, lon, zoom = 6) {
    this.map.setView([lat, lon], zoom);
  },
};
