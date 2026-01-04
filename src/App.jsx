import { useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to fetch API

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!weatherResponse.ok) {
        throw new Error("City not found");
      }

      const weatherData = await weatherResponse.json();

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );

      const forecastData = await forecastResponse.json();

      setWeatherData(weatherData);
      setForecastData(forecastData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setWeatherData(null);
      setForecastData(null);
    }
  };

  const fetchWeatherByLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

          // to Fetch current weather by coordinates
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );

          if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data");
          }

          const weatherData = await weatherResponse.json();

          // to Fetch forecast by coordinates
          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );

          const forecastData = await forecastResponse.json();

          setWeatherData(weatherData);
          setForecastData(forecastData);
          setCity(weatherData.name); // Update search box with detected city
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        setError("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Weather App ☀️
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              />
              <button
                onClick={fetchWeather}
                disabled={loading}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <button
              onClick={fetchWeatherByLocation}
              disabled={loading}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>📍</span>
              {loading ? "Getting location..." : "Use My Location"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Weather Display */}
        {weatherData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* City Name & Country */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                {weatherData.name}, {weatherData.sys.country}
              </h2>
              <p className="text-gray-600 capitalize">
                {weatherData.weather[0].description}
              </p>
            </div>

            {/* Temperature & Icon */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt="weather icon"
                className="w-24 h-24"
              />
              <div className="text-6xl font-bold text-gray-800">
                {Math.round(weatherData.main.temp)}°C
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Feels Like</p>
                <p className="text-xl font-semibold text-gray-800">
                  {Math.round(weatherData.main.feels_like)}°C
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Humidity</p>
                <p className="text-xl font-semibold text-gray-800">
                  {weatherData.main.humidity}%
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Wind Speed</p>
                <p className="text-xl font-semibold text-gray-800">
                  {weatherData.wind.speed} m/s
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Pressure</p>
                <p className="text-xl font-semibold text-gray-800">
                  {weatherData.main.pressure} hPa
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecastData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              5-Day Forecast
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {forecastData.list
                .filter((item, index) => index % 8 === 0) // Get one per day (every 8th item = 24 hours)
                .slice(0, 5)
                .map((item, index) => {
                  const date = new Date(item.dt * 1000);
                  const dayName = date.toLocaleDateString("en-US", {
                    weekday: "short",
                  });

                  return (
                    <div
                      key={index}
                      className="bg-blue-50 p-4 rounded-lg text-center"
                    >
                      <p className="font-semibold text-gray-800 mb-2">
                        {dayName}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                        alt="weather icon"
                        className="w-12 h-12 mx-auto"
                      />
                      <p className="text-sm text-gray-600 capitalize mb-2">
                        {item.weather[0].description}
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        {Math.round(item.main.temp)}°C
                      </p>
                      <p className="text-sm text-gray-600">
                        H: {Math.round(item.main.temp_max)}° L:{" "}
                        {Math.round(item.main.temp_min)}°
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
