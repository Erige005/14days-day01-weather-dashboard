/**
 * api.js — Gọi OpenWeatherMap API, xử lý bất đồng bộ + lỗi
 */

const BASE_URL = "https://api.openweathermap.org/data/2.5";

class WeatherAPIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "WeatherAPIError";
    this.status = status;
  }
}

const WeatherAPI = {
  async _fetchJSON(url) {
    let response;
    try {
      // cache: "no-store" + tham số "_" chống trình duyệt trả về dữ liệu cũ đã cache,
      // đảm bảo luôn lấy số liệu mới nhất từ OpenWeatherMap.
      response = await fetch(`${url}&_=${Date.now()}`, { cache: "no-store" });
    } catch (networkErr) {
      throw new WeatherAPIError(
        "Không thể kết nối tới máy chủ thời tiết. Kiểm tra mạng của bạn.",
        0
      );
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new WeatherAPIError("Không tìm thấy thành phố này.", 404);
      }
      if (response.status === 401) {
        throw new WeatherAPIError(
          "API key không hợp lệ hoặc chưa được kích hoạt (chờ vài phút sau khi đăng ký).",
          401
        );
      }
      throw new WeatherAPIError(`Lỗi máy chủ (${response.status}).`, response.status);
    }

    return response.json();
  },

  async getCurrentByCity(cityName, unit = "metric") {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(
      cityName
    )}&units=${unit}&lang=vi&appid=${CONFIG.API_KEY}`;
    return this._fetchJSON(url);
  },

  async getCurrentByCoords(lat, lon, unit = "metric") {
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${unit}&lang=vi&appid=${CONFIG.API_KEY}`;
    return this._fetchJSON(url);
  },

  async getForecastByCity(cityName, unit = "metric") {
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(
      cityName
    )}&units=${unit}&lang=vi&appid=${CONFIG.API_KEY}`;
    return this._fetchJSON(url);
  },

  async getForecastByCoords(lat, lon, unit = "metric") {
    const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${unit}&lang=vi&appid=${CONFIG.API_KEY}`;
    return this._fetchJSON(url);
  },

  /**
   * API /forecast trả về dữ liệu mỗi 3 giờ (40 điểm cho 5 ngày).
   * Hàm này gộp lại thành 1 điểm đại diện mỗi ngày (ưu tiên mốc 12:00 trưa).
   */
  aggregateDailyForecast(forecastList) {
    const byDate = {};
    forecastList.forEach((entry) => {
      const [date, time] = entry.dt_txt.split(" ");
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push({ ...entry, time });
    });

    return Object.entries(byDate)
      .map(([date, entries]) => {
        const noon =
          entries.find((e) => e.time === "12:00:00") || entries[Math.floor(entries.length / 2)];
        return {
          date,
          temp: noon.main.temp,
          tempMin: Math.min(...entries.map((e) => e.main.temp_min)),
          tempMax: Math.max(...entries.map((e) => e.main.temp_max)),
          weather: noon.weather[0],
        };
      })
      .slice(0, 5);
  },
};
