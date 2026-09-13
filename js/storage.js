/**
 * storage.js — Đọc/ghi dữ liệu client-side (localStorage)
 * Quản lý: danh sách thành phố yêu thích, đơn vị nhiệt độ (C/F)
 */

const STORAGE_KEYS = {
  FAVORITES: "weather_favorites",
  UNIT: "weather_unit",
  LAST_CITY: "weather_last_city",
};

const AppStorage = {
  getFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Lỗi đọc favorites:", e);
      return [];
    }
  },

  addFavorite(cityName) {
    const favorites = this.getFavorites();
    const normalized = cityName.trim();
    if (!normalized) return favorites;
    const exists = favorites.some(
      (c) => c.toLowerCase() === normalized.toLowerCase()
    );
    if (!exists) {
      favorites.push(normalized);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
    return favorites;
  },

  removeFavorite(cityName) {
    const favorites = this.getFavorites().filter(
      (c) => c.toLowerCase() !== cityName.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return favorites;
  },

  getUnit() {
    return localStorage.getItem(STORAGE_KEYS.UNIT) || "metric"; // metric = °C, imperial = °F
  },

  setUnit(unit) {
    localStorage.setItem(STORAGE_KEYS.UNIT, unit);
  },

  getLastCity() {
    return localStorage.getItem(STORAGE_KEYS.LAST_CITY) || "";
  },

  setLastCity(cityName) {
    localStorage.setItem(STORAGE_KEYS.LAST_CITY, cityName);
  },
};
