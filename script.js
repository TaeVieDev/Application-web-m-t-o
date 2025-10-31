// Configuration de l'API
const API_KEY = "REDACTED_API_KEY";

// Fonction principale pour récupérer les données météo
async function fetchWeather() {
    const searchInput = document.getElementById("search").value.trim();
    const weatherDataSection = document.getElementById("weather-data");
    weatherDataSection.style.display = "block";

    // Vérification de l'entrée utilisateur
    if (searchInput === "") {
        displayError("Empty Input!", "Please try again with a valid <u>city name</u>.");
        return;
    }

    try {
        // Récupération des coordonnées géographiques
        const geocodeData = await getLonAndLat(searchInput);
        if (!geocodeData) return;

        // Récupération des données météo
        await getWeatherData(geocodeData.lon, geocodeData.lat);
        
        // Effacement du champ de recherche après succès
        document.getElementById("search").value = "";
    } catch (error) {
        console.error("Error fetching weather data:", error);
        displayError("Error", "An error occurred while fetching weather data. Please try again.");
    }
}

// Fonction pour récupérer les coordonnées géographiques
async function getLonAndLat(searchInput) {
    const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchInput)}&limit=1&appid=${API_KEY}`;

    try {
        const response = await fetch(geocodeURL);
        if (!response.ok) {
            console.log("Bad response! ", response.status);
            displayError("API Error", "Unable to fetch location data. Please try again later.");
            return null;
        }

        const data = await response.json();
        if (data.length === 0) {
            console.log("No location found for:", searchInput);
            displayError(`Invalid Input: "${searchInput}"`, "Please try again with a valid <u>city name</u>.");
            return null;
        }

        return data[0];
    } catch (error) {
        console.error("Error in getLonAndLat:", error);
        displayError("Network Error", "Unable to connect to the weather service. Please check your internet connection.");
        return null;
    }
}

// Fonction pour récupérer les données météo
async function getWeatherData(lon, lat) {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const response = await fetch(weatherURL);
        if (!response.ok) {
            console.log("Bad response! ", response.status);
            displayError("API Error", "Unable to fetch weather data. Please try again later.");
            return;
        }

        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        console.error("Error in getWeatherData:", error);
        displayError("Network Error", "Unable to fetch weather information. Please try again.");
    }
}

// Fonction pour afficher les données météo
function displayWeatherData(data) {
    const weatherDataSection = document.getElementById("weather-data");
    const temperature = Math.round(data.main.temp - 273.15);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const cityName = data.name;

    weatherDataSection.style.display = "flex";
    weatherDataSection.innerHTML = `
        <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                 alt="${description}" />
        </div>
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
            <div class="additional-info">
                <span class="feels-like">Feels like: ${Math.round(data.main.feels_like - 273.15)}°C</span>
                <span class="humidity">Humidity: ${data.main.humidity}%</span>
            </div>
        </div>
    `;
}

// Fonction utilitaire pour afficher les erreurs
function displayError(title, message) {
    const weatherDataSection = document.getElementById("weather-data");
    weatherDataSection.innerHTML = `
        <div>
            <h2>${title}</h2>
            <p>${message}</p>
        </div>
    `;
}
