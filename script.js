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

// Adding event listener to the GitHub button:-
gitHub.addEventListener("click", () => {
    window.open("https://github.com/indrakhichaki-16", "_blank");
})

// Declaring empty array to store the city names for dropdown_menu:-
let cityNamesList = JSON.parse(localStorage.getItem("cityNamesList")) || [];

// Toggle the visibility of the input field based on the selected radio button:-
const toggle_city = () => {
    if (radioCity.checked) {
        cityInput.style.display = "block";
    } else {
        cityInput.style.display = "none";
    }
};

toggle_city();
radioCity.addEventListener("change", toggle_city);
radioCurrentLocation.addEventListener("change", toggle_city);

// toggling the dropdown menu:-
cityInput.addEventListener("input", () => {
    const inputValue = cityInput.value.trim().toLowerCase();

    // Filter cities that match the input
    const filteredCities = cityNamesList.filter((city) =>
        city.toLowerCase().startsWith(inputValue)
    );

    // Display the dropdown menu if there are matching cities:-
    if (filteredCities.length > 0) {
        dropDown.style.display = "block";
        dropdownCities.innerHTML = "";

        filteredCities.forEach((city) => {
            dropdownCities.innerHTML += `<li class="cursor-pointer p-1 rounded hover:bg-slate-300">${city}</li>`;
        });

        // Adding event listener to the dropdown menu:-
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

