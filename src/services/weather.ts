// Fetch real-time weather from Open-Meteo (no API key required)
export const initWeatherWidget = async () => {
    const tempEl = document.getElementById('weather-temp-portal') || document.getElementById('weather-temp')
    const iconEl = document.getElementById('weather-icon-portal') || document.getElementById('weather-icon')
    if (!tempEl || !iconEl) return

    // Map WMO weathercode to Material Symbols icon name
    const getIcon = (code: number): string => {
        if (code === 0) return 'wb_sunny'                   // Clear sky
        if (code <= 2) return 'partly_cloudy_day'          // Partly cloudy
        if (code === 3) return 'cloud'                      // Overcast
        if (code <= 49) return 'foggy'                      // Fog/mist
        if (code <= 67) return 'rainy'                      // Rain/drizzle
        if (code <= 77) return 'ac_unit'                    // Snow
        if (code <= 82) return 'rainy'                      // Rain showers
        if (code <= 99) return 'thunderstorm'               // Thunderstorm
        return 'wb_sunny'
    }

    const fetchWeather = async () => {
        try {
            const windEl = document.getElementById('wind-speed')
            const humidityEl = document.getElementById('humidity')

            // Coords for Phu Ly, Ha Nam / Ninh Binh area: 20.54, 105.93
            const url = 'https://api.open-meteo.com/v1/forecast?latitude=20.54&longitude=105.93&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FBangkok'
            const res = await fetch(url)
            const data = await res.json()

            if (data && data.current) {
                const temp = Math.round(data.current.temperature_2m)
                const code = data.current.weather_code ?? data.current.weathercode ?? 0
                const wind = data.current.wind_speed_10m
                const humidity = data.current.relative_humidity_2m

                tempEl.textContent = `${temp}°C`
                iconEl.textContent = getIcon(code)
                if (windEl) windEl.textContent = `${wind} m/s`
                if (humidityEl) humidityEl.textContent = `${humidity}%`
            }
        } catch (e) {
            console.error('Weather fetch failed:', e)
        }
    }

    await fetchWeather()
    // Refresh every 10 minutes
    setInterval(fetchWeather, 10 * 60 * 1000)
}
