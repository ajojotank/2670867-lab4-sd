document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 100,
    }).addTo(map);

    let marker;

    map.on('click', function(e) {
        const { lat, lng } = e.latlng;

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([lat, lng]).addTo(map);
        fetchCountryByLatLng(lat, lng);
    });
});

// Utility functions

function displayError(message) {
    const countryInfoSection = document.getElementById('country-info');
    const borderingCountriesSection = document.getElementById('bordering-countries');
    countryInfoSection.innerHTML = `<p class="error">${message}</p>`;
    borderingCountriesSection.innerHTML = '';
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function fetchCountryByLatLng(lat, lng) {
    showLoading();
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            const countryName = data.address.country;
            if (countryName) {
                fetchCountryData(countryName);
            } else {
                displayError('Country not found.');
            }
        })
        .catch(error => {
            displayError('An error occurred while fetching the data.');
        })
        .finally(() => {
            hideLoading();
        });
}


document.getElementById('submit-button').addEventListener('click', function() {
    const countryName = document.getElementById('country-name').value;
    if (countryName) {
        fetchCountryData(countryName);
    } else {
        alert('Please enter a country name.');
    }
});

function fetchCountryData(countryName) {
    showLoading();
    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 404) {
                displayError('Country not found.');
            } else {
                const country = data[0];
                displayCountryInfo(country);
                fetchBorderingCountries(country.borders);
            }
        })
        .catch(error => {
            displayError('An error occurred while fetching the data.');
        })
        .finally(() => {
            hideLoading();
        });
}

function displayCountryInfo(country) {
    const countryInfoSection = document.getElementById('country-info');
    countryInfoSection.innerHTML = `
        <h2>${country.name.common}</h2>
        <p><strong>Capital:</strong> ${country.capital[0]}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
    `;
}

function fetchBorderingCountries(borders) {
    if (!borders || borders.length === 0) {
        displayError('No bordering countries found.');
        return;
    }

    const borderingCountriesSection = document.getElementById('bordering-countries');
    borderingCountriesSection.innerHTML = '<h3>Bordering Countries:</h3>';

    borders.forEach(border => {
        fetch(`https://restcountries.com/v3.1/alpha/${border}`)
            .then(response => response.json())
            .then(data => {
                const country = data[0];
                borderingCountriesSection.innerHTML += `
                    <p><strong>${country.name.common}:</strong> <img src="${country.flags.png}" alt="Flag of ${country.name.common}"></p>
                `;
            })
            .catch(error => {
                displayError('An error occurred while fetching bordering countries.');
            });
    });
}