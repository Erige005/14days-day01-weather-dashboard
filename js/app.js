/**
 * app.js — Entry point: điều phối API, Storage, UI, Map + gắn event listener
 */

let state = {
  unit: "metric",
  currentCity: "",
};

async function loadWeatherForCity(cityName) {
  UI.showStatus("Đang tải dữ liệu...", "info");
  try {
    const [current, forecastRaw] = await Promise.all([
      WeatherAPI.getCurrentByCity(cityName, state.unit),
      WeatherAPI.getForecastByCity(cityName, state.unit),
    ]);
    applyCurrentWeather(current, forecastRaw);
  } catch (err) {
    UI.showStatus(err.message || "Đã có lỗi xảy ra.", "error");
  }
}

async function loadWeatherForCoords(lat, lon) {
  UI.showStatus("Đang lấy thời tiết theo vị trí của bạn...", "info");
  try {
    const [current, forecastRaw] = await Promise.all([
      WeatherAPI.getCurrentByCoords(lat, lon, state.unit),
      WeatherAPI.getForecastByCoords(lat, lon, state.unit),
    ]);
    applyCurrentWeather(current, forecastRaw);
  } catch (err) {
    UI.showStatus(err.message || "Đã có lỗi xảy ra.", "error");
  }
}

function applyCurrentWeather(current, forecastRaw) {
  state.currentCity = current.name;
  AppStorage.setLastCity(current.name);

  UI.renderCurrentWeather(current, state.unit);
  UI.renderForecast(WeatherAPI.aggregateDailyForecast(forecastRaw.list), state.unit);

  WeatherMap.setCityMarker(current.name, {
    lat: current.coord.lat,
    lon: current.coord.lon,
    temp: current.main.temp,
    unit: state.unit,
    label: current.name,
    highlighted: true,
  });
  WeatherMap.focusOn(current.coord.lat, current.coord.lon, 7);

  refreshFavorites();
  refreshFavoriteMarkers();
  UI.clearStatus();
}

function refreshFavorites() {
  UI.renderFavorites(
    AppStorage.getFavorites(),
    state.currentCity,
    (city) => loadWeatherForCity(city),
    (city) => {
      AppStorage.removeFavorite(city);
      WeatherMap.removeCityMarker(city);
      refreshFavorites();
    }
  );
}

/** Lấy nhiệt độ hiện tại của các thành phố yêu thích để hiển thị bubble trên map */
async function refreshFavoriteMarkers() {
  const favorites = AppStorage.getFavorites().filter(
    (c) => c.toLowerCase() !== state.currentCity.toLowerCase()
  );
  await Promise.all(
    favorites.map(async (city) => {
      try {
        const data = await WeatherAPI.getCurrentByCity(city, state.unit);
        WeatherMap.setCityMarker(city, {
          lat: data.coord.lat,
          lon: data.coord.lon,
          temp: data.main.temp,
          unit: state.unit,
          label: city,
          highlighted: false,
        });
      } catch (e) {
        // Bỏ qua nếu 1 thành phố yêu thích lỗi (VD tên không hợp lệ), không chặn cả trang
        console.warn(`Không lấy được thời tiết cho ${city}:`, e.message);
      }
    })
  );
}

function handleSearch() {
  const city = UI.els.searchInput.value.trim();
  if (!city) {
    UI.showStatus("Vui lòng nhập tên thành phố.", "error");
    return;
  }
  loadWeatherForCity(city);
}

function handleLocate() {
  if (!navigator.geolocation) {
    UI.showStatus("Trình duyệt không hỗ trợ định vị.", "error");
    return;
  }
  UI.showStatus("Đang xin quyền truy cập vị trí...", "info");
  navigator.geolocation.getCurrentPosition(
    (pos) => loadWeatherForCoords(pos.coords.latitude, pos.coords.longitude),
    () => UI.showStatus("Không thể lấy vị trí. Vui lòng cho phép quyền truy cập vị trí.", "error")
  );
}

function handleUnitToggle(unit) {
  if (unit === state.unit) return;
  state.unit = unit;
  AppStorage.setUnit(unit);
  UI.setUnitToggle(unit);
  if (state.currentCity) loadWeatherForCity(state.currentCity);
}

function handleAddFavorite() {
  if (!state.currentCity) {
    UI.showStatus("Hãy tìm một thành phố trước khi thêm vào yêu thích.", "error");
    return;
  }
  AppStorage.addFavorite(state.currentCity);
  refreshFavorites();
  refreshFavoriteMarkers();
}

function init() {
  UI.init();
  WeatherMap.init();
  state.unit = AppStorage.getUnit();
  UI.setUnitToggle(state.unit);

  UI.els.searchBtn.addEventListener("click", handleSearch);
  UI.els.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });
  UI.els.locateBtn.addEventListener("click", handleLocate);
  UI.els.unitToggle.querySelectorAll("span").forEach((el) => {
    el.addEventListener("click", () => handleUnitToggle(el.dataset.unit));
  });
  UI.els.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    UI.setTheme(current === "dark" ? "light" : "dark");
  });

  // Event delegation cho nút "+ Thêm yêu thích" (được render động trong ui.js)
  UI.els.favoritesRow.addEventListener("click", (e) => {
    if (e.target.id === "add-favorite-chip") handleAddFavorite();
  });

  refreshFavorites();
  refreshFavoriteMarkers();

  const lastCity = AppStorage.getLastCity();
  if (lastCity) {
    loadWeatherForCity(lastCity);
  } else {
    UI.showStatus("Nhập tên thành phố hoặc bấm 📍 để bắt đầu.", "info");
  }
}

document.addEventListener("DOMContentLoaded", init);
