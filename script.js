// Selecting all necessary HTML elements for manipulation
const radioCity = document.getElementById("city");
const radioCurrentLocation = document.getElementById("current_location");
const cityInput = document.getElementById("city_input");
const dropDown = document.getElementById("dropdown");
const searchButton = document.getElementById("search");
const cityName = document.getElementById("city_name");
const temp = document.getElementById("temp");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const weatherImg = document.getElementById("weather_img");
const weatherDescription = document.getElementById("weather_description");
const cardContainer = document.getElementById("card_container");
const dropdownCities = document.getElementById("dropdown_cities");
const gitHub = document.getElementById("github_btn");

// Implementing GitHub Button Event Listener
gitHub.addEventListener("click", () => {
    window.open("https://github.com/indrakhichaki-16/Weather-forecast-application/tree/main", "_blank");
})

// Local Storage Setup - initialize or retrieve city names list from local storage
let cityNamesList = JSON.parse(localStorage.getItem("cityNamesList")) || [];

// Radio Button Toggle Function - toggles the visibility of city input field based on the selection
const toggle_city = () => {
    if (radioCity.checked) {
        cityInput.style.display = "block";
    } else {
        cityInput.style.display = "none";
    }
};

// Initial call to set correct input field visibility
toggle_city();

// Add event listeners for radio button changes
radioCity.addEventListener("change", toggle_city);
radioCurrentLocation.addEventListener("change", toggle_city);

// Handles the city search input and dropdown display
cityInput.addEventListener("input", () => {
    const inputValue = cityInput.value.trim().toLowerCase();

    // Filter cities that match the input
    const filteredCities = cityNamesList.filter((city) =>
        city.toLowerCase().startsWith(inputValue)
    );

    // Display dropdown if matching cities are found
    if (filteredCities.length > 0) {
        dropDown.style.display = "block";
        dropdownCities.innerHTML = "";

        // Create list items for each matching city
        filteredCities.forEach((city) => {
            dropdownCities.innerHTML += `<li class="cursor-pointer p-1 rounded hover:bg-slate-300">${city}</li>`;
        });

        // Add click event listener to dropdown items
        dropdownCities.querySelectorAll("li").forEach((li) => {
            li.addEventListener("click", () => {
                cityInput.value = li.textContent;
                dropDown.style.display = "none";
            });
        });
    } else {
        dropDown.style.display = "none";
    }
});

// Closes the dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!dropDown.contains(e.target) && e.target !== cityInput) {
        dropDown.style.display = "none";
    }
});

// OpenWeatherMap API Configuration - API key for OpenWeatherMap service
const OPENWEATHERMAP_API_KEY = '19babf6ebd4152ad29b72e684571a678';

// Processes 3-hourly forecast data to get daily forecasts
function getDailyForecast(list) {
    const days = {};
    // Group forecasts by date
    list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!days[date]) {
            days[date] = [];
        }
        days[date].push(item);
    });
    // For each day, select forecast closest to 12:00
    return Object.values(days).slice(0, 5).map(dayArr => {
        let target = dayArr.reduce((prev, curr) => {
            return Math.abs(new Date(curr.dt_txt).getHours() - 12) < Math.abs(new Date(prev.dt_txt).getHours() - 12) ? curr : prev;
        });
        return target;
    });
}

// Error Handling Function - displays error message with specific error types
const handleError = (error) => {
    console.error(error);
    
    // Clear previous weather data
    cityName.innerHTML = '';
    temp.innerHTML = '';
    wind.innerHTML = '';
    humidity.innerHTML = '';
    weatherImg.src = '';
    weatherDescription.innerHTML = '';
    cardContainer.innerHTML = '';

    // Create and display error message based on error type
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-center p-4 bg-red-500/20 rounded-lg text-white';
    
    let errorMessage = '';
    // Handle different types of errors with specific messages
    if (error.message === 'Empty city name') {
        errorMessage = 'Please enter a city name';
    } else if (error.message === 'Invalid city name') {
        errorMessage = 'Please enter a valid city name';
    } else if (error.message === 'location not supported') {
        errorMessage = 'Location is not supported by your browser';
    } else if (error.message === 'location denied') {
        errorMessage = 'Please allow location access to get weather for your current location';
    } else if (error.message === 'location timeout') {
        errorMessage = 'Location request timed out. Please try again';
    } else if (error.message === 'Invalid API key') {
        errorMessage = 'Invalid API key. Please check your API key';
    } else if (error.message === 'City not found') {
        errorMessage = 'City not found. Please check the spelling and try again';
    } else if (error.message === 'API rate limit exceeded') {
        errorMessage = 'Too many requests. Please try again later';
    } else if (error.message === 'Network error') {
        errorMessage = 'Network connection error. Please check your internet connection';
    } else if (error.message === 'Server error') {
        errorMessage = 'Weather service is temporarily unavailable. Please try again later';
    } else {
        errorMessage = 'An error occurred. Please try again';
    }

    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
        <p class="font-medium">${errorMessage}</p>
    `;
    cardContainer.appendChild(errorDiv);
};

// Input validation function
const validateCityInput = (city) => {
    // Remove any special characters and extra spaces
    const sanitizedCity = city.trim().replace(/[^a-zA-Z\s]/g, '');
    
    if (!sanitizedCity) {
        throw new Error('Empty city name');
    }
    
    if (sanitizedCity.length < 2) {
        throw new Error('Invalid city name');
    }
    
    return sanitizedCity;
};

// Fetches weather data for a specific city
const getWeatherByCityName = async (city = "kolkata") => {
    try {
        // Fetch weather data from OpenWeatherMap API
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
        );
        
        // Handle different HTTP status codes
        if (!response.ok) {
            switch (response.status) {
                case 400:
                    throw new Error('Invalid city name');
                case 401:
                    throw new Error('Invalid API key');
                case 404:
                    throw new Error('City not found');
                case 429:
                    throw new Error('API rate limit exceeded');
                case 500:
                case 502:
                case 503:
                case 504:
                    throw new Error('Server error');
                default:
                    throw new Error('Network error');
            }
        }
        
        const data = await response.json();
        
        // Validate API response data
        if (data.cod !== "200") {
            throw new Error('City not found');
        }

        // Clear previous error messages
        cardContainer.innerHTML = '';

        // Update current weather information
        const current = data.list[0];
        cityName.innerHTML = `${data.city.name} (${current.dt_txt.split(' ')[0]})`;
        temp.innerHTML = `Temperature: <span class="font-normal">${current.main.temp}<sup>o</sup> C</span>`;
        wind.innerHTML = `Wind: <span class="font-normal">${current.wind.speed} kmph</span>`;
        humidity.innerHTML = `Humidity: <span class="font-normal">${current.main.humidity}%</span>`;
        weatherImg.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
        weatherImg.alt = current.weather[0].description;
        weatherDescription.innerHTML = current.weather[0].description;

        // Generate 5-day weather forecast
        const daily = getDailyForecast(data.list);
        daily.forEach(item => {
            cardContainer.innerHTML += `<div class="forecast-card min-w-[200px] flex flex-col items-center justify-center gap-1 bg-white/10 backdrop-blur-sm text-white rounded-lg py-2 px-4">
                <h4 class="font-bold">${item.dt_txt.split(' ')[0]}</h4>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}" width="70" height="70" class="drop-shadow-sm" />
                <p class="self-start font-semibold">Temp:<span class="text-sm ml-1 font-normal">${item.main.temp}<sup>o</sup> C</span></p>
                <p class="self-start font-semibold">Wind:<span class="text-sm ml-1 font-normal">${item.wind.speed} kph</span></p>
                <p class="self-start font-semibold">Humidity:<span class="text-sm ml-1 font-normal">${item.main.humidity}%</span></p>
            </div>`;
        });
    } catch (err) {
        // Handle network errors
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
            handleError(new Error('Network error'));
        } else {
            handleError(err);
        }
    }
};

// Fetches weather data for current location
const getWeatherByCurrentLocation = async (latitude, longitude) => {
    try {
        // Fetch weather data using coordinates
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
        );
        
        // Handle different HTTP status codes
        if (!response.ok) {
            switch (response.status) {
                case 400:
                    throw new Error('Invalid coordinates');
                case 401:
                    throw new Error('Invalid API key');
                case 429:
                    throw new Error('API rate limit exceeded');
                case 500:
                case 502:
                case 503:
                case 504:
                    throw new Error('Server error');
                default:
                    throw new Error('Network error');
            }
        }
        
        const data = await response.json();
        
        // Validate API response data
        if (data.cod !== "200") {
            throw new Error('Location data not found');
        }

        // Clear previous error messages
        cardContainer.innerHTML = '';

        // Update current weather information
        const current = data.list[0];
        cityName.innerHTML = `${data.city.name} (${current.dt_txt.split(' ')[0]})`;
        temp.innerHTML = `Temperature: <span class="font-normal">${current.main.temp}<sup>o</sup> C</span>`;
        wind.innerHTML = `Wind: <span class="font-normal">${current.wind.speed} kmph</span>`;
        humidity.innerHTML = `Humidity: <span class="font-normal">${current.main.humidity}%</span>`;
        weatherImg.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
        weatherImg.alt = current.weather[0].description;
        weatherDescription.innerHTML = current.weather[0].description;

        // Generate 5-day weather forecast
        const daily = getDailyForecast(data.list);
        daily.forEach(item => {
            cardContainer.innerHTML += `<div class="forecast-card min-w-[200px] flex flex-col items-center justify-center gap-1 bg-white/10 backdrop-blur-sm text-white rounded-lg py-2 px-4">
                <h4 class="font-bold">${item.dt_txt.split(' ')[0]}</h4>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}" width="70" height="70" class="drop-shadow-sm" />
                <p class="self-start font-semibold">Temp:<span class="text-sm ml-1 font-normal">${item.main.temp}<sup>o</sup> C</span></p>
                <p class="self-start font-semibold">Wind:<span class="text-sm ml-1 font-normal">${item.wind.speed} kph</span></p>
                <p class="self-start font-semibold">Humidity:<span class="text-sm ml-1 font-normal">${item.main.humidity}%</span></p>
            </div>`;
        });
    } catch (err) {
        // Handle network errors
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
            handleError(new Error('Network error'));
        } else {
            handleError(err);
        }
    }
};

// Search Button Event Listener
searchButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (radioCity.checked) {
        try {
            const cityName = validateCityInput(cityInput.value);

            // Store new city names in local storage
            if (!cityNamesList.includes(cityName)) {
                cityNamesList.push(cityName);
                localStorage.setItem("cityNamesList", JSON.stringify(cityNamesList));
            }
            getWeatherByCityName(cityName);
        } catch (error) {
            handleError(error);
        }
    } else {
        // Handle current location weather
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    getWeatherByCurrentLocation(latitude, longitude);
                },
                (error) => {
                    let errorMessage;
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Geolocation denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Geolocation timeout';
                            break;
                        default:
                            errorMessage = 'An error occurred while getting location';
                    }
                    handleError(new Error(errorMessage));
                },
                {
                    timeout: 10000, // 10 seconds timeout
                    maximumAge: 0,
                    enableHighAccuracy: true
                }
            );
        } else {
            handleError(new Error('Geolocation not supported'));
        }
    }
});