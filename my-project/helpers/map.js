let mark;

async function initializeMap() {
    try {
        // Wait for the geolocation coordinates
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;

        var map = L.map('map').setView([latitude, longitude], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        mark = L.marker([latitude, longitude], {draggable: true}).addTo(map)
            .bindPopup(`Tu ubicación es [${latitude.toFixed(5)}, ${longitude.toFixed(5)}]`)
            .openPopup();

        mark.on('dragend', function(e) {
            const marker = e.target;
            const position = marker.getLatLng();
            marker.setPopupContent(`Tu ubicación es [${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}]`)
                .openPopup();
        });

    } catch (error) {
        console.error("Geolocation error:", error);
        // Handle geolocation error here
    }
}

initializeMap();