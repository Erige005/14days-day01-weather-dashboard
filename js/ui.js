/**
 * ui.js — Render dữ liệu ra DOM (không chứa logic gọi API)
 */

const WEEKDAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const WEATHER_ICONS = {
  "01": "☀️", "02": "🌤", "03": "☁️", "04": "☁️",
  "09": "🌧", "10": "🌦", "11": "⛈", "13": "❄️", "50": "🌫",
};

function getIcon(iconCode) {
  return WEATHER_ICONS[iconCode?.slice(0, 2)] || "🌡";
}

function unitSymbol(unit) {
  return unit === "imperial" ? "°F" : "°C";
}

/**
 * data.dt: unix timestamp (giây, UTC) của lần đo mà OpenWeatherMap trả về.
 * data.timezone: lệch múi giờ của thành phố đó so với UTC (giây).
 * => Tính giờ địa phương tại chính thành phố đó để hiển thị "Cập nhật lúc".
 */
function formatUpdatedTime(dtUnix, timezoneOffsetSec) {
  const localMs = (dtUnix + timezoneOffsetSec) * 1000;
  const d = new Date(localMs);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const UI = {
  els: {},

  init() {
    this.els = {
      searchInput: document.getElementById("city-input"),
      searchBtn: document.getElementById("search-btn"),
      locateBtn: document.getElementById("locate-btn"),
      favoritesRow: document.getElementById("favorites-row"),
      currentCard: document.getElementById("current-card"),
      forecastCard: document.getElementById("forecast-card"),
      unitToggle: document.getElementById("unit-toggle"),
      themeToggle: document.getElementById("theme-toggle"),
      statusMsg: document.getElementById("status-msg"),
    };
    return this.els;
  },

  showStatus(message, type = "info") {
    this.els.statusMsg.textContent = message;
    this.els.statusMsg.className = `status ${type}`;
    this.els.statusMsg.hidden = !message;
  },

  clearStatus() {
    this.showStatus("");
  },

  renderCurrentWeather(data, unit) {
    const { name, sys, main, weather, wind, dt, timezone } = data;
    const icon = getIcon(weather[0].icon);
    const sym = unitSymbol(unit);
    const updatedAt = formatUpdatedTime(dt, timezone);

    this.els.currentCard.hidden = false;
    this.els.currentCard.innerHTML = `
      <div class="current-top">
        <div>
          <div class="place">${name}, ${sys.country}</div>
          <div class="temp">${Math.round(main.temp)}${sym}</div>
          <div class="desc">${weather[0].description}, cảm giác như ${Math.round(
      main.feels_like
    )}${sym}</div>
          <div class="updated-at">🕐 Cập nhật lúc ${updatedAt} (giờ địa phương tại ${name})</div>
        </div>
        <div style="text-align:right;">
          <div class="emoji-lg">${icon}</div>
        </div>
      </div>
      <div class="details">
        <div class="detail"><div class="label">Độ ẩm</div><div class="value">💧 ${main.humidity}%</div></div>
        <div class="detail"><div class="label">Gió</div><div class="value">💨 ${Math.round(
          wind.speed * 3.6
        )} km/h</div></div>
        <div class="detail"><div class="label">Áp suất</div><div class="value">🌡 ${main.pressure} hPa</div></div>
      </div>
    `;
  },

  renderForecast(days, unit) {
    const sym = unitSymbol(unit);
    this.els.forecastCard.hidden = false;
    const strip = days
      .map((d) => {
        const dayName = WEEKDAYS_VI[new Date(d.date).getDay()];
        return `
          <div class="fday">
            <div class="d">${dayName}</div>
            <div class="e">${getIcon(d.weather.icon)}</div>
            <div class="t">${Math.round(d.temp)}${sym}</div>
          </div>
        `;
      })
      .join("");
    this.els.forecastCard.querySelector(".forecast-strip").innerHTML = strip;
  },

  renderFavorites(favorites, activeCity, onSelect, onRemove) {
    this.els.favoritesRow.innerHTML =
      favorites
        .map(
          (city) => `
        <div class="chip ${city.toLowerCase() === (activeCity || "").toLowerCase() ? "active" : ""}" data-city="${city}">
          <b class="chip-select">${city}</b><span class="x" data-remove="${city}">✕</span>
        </div>
      `
        )
        .join("") +
      `<div class="chip add" id="add-favorite-chip">+ Thêm yêu thích</div>`;

    this.els.favoritesRow.querySelectorAll(".chip-select").forEach((el) => {
      el.addEventListener("click", (e) => onSelect(e.target.closest(".chip").dataset.city));
    });
    this.els.favoritesRow.querySelectorAll("[data-remove]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onRemove(el.dataset.remove);
      });
    });
  },

  setUnitToggle(unit) {
    this.els.unitToggle.querySelectorAll("span").forEach((el) => {
      el.classList.toggle("active", el.dataset.unit === unit);
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  },
};
