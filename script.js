var locations = [];
var markers = [];
var map;

function initMap() {

    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([107.6186, -6.9039]),
            zoom: 12
        })
    });
    // Get the user's location
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            // Set the map's center to the user's location
            var userLocation = ol.proj.fromLonLat([
                position.coords.longitude,
                position.coords.latitude,
            ]);
            map.getView().setCenter(userLocation);
        });
    } else {
        alert('Geolocation is not available');
    }

    map.on('click', function (evt) {
        var coordinate = evt.coordinate;

        // add marker to the clicked location
        var marker = new ol.Feature({
            geometry: new ol.geom.Point(coordinate)
        });
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                src: 'pin.png'
            })
        });
        marker.setStyle(iconStyle);

        var vectorSource = new ol.source.Vector({
            features: [marker]
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });
        map.addLayer(vectorLayer);

        // add the marker to the markers array
        markers.push(marker);

        // add the location to the locations list
        var lonlat = ol.proj.toLonLat(coordinate);
        locations.push({
            longitude: lonlat[0],
            latitude: lonlat[1]
        });
        updateLocationsList();
    });
}

function getVillageName(lon, lat) {
    var url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lon + '&addressdetails=1';
    var village = '';
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);

    if (request.status === 200) {
        var result = JSON.parse(request.responseText);
        if (result.address) {
            village = result.address.road + ', ' + result.address.suburb + ', ' + result.address.city + ', ' + result.address.country;
            console.log(village)
        }
    }
    return village;
}

function getLocationInfo(location) {
    var lon = location.longitude;
    var lat = location.latitude;
    var village = getVillageName(lon, lat);
    return 'Village: ' + village;
}

function updateLocationsList() {
    var locationsList = document.getElementById('locations');
    locationsList.innerHTML = '';

    for (var i = 0; i < locations.length; i++) {
        var location = locations[i];

        // reverse geocode the coordinates to get the village name
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + location.latitude + '&lon=' + location.longitude, false);
        xhr.send();
        var response = JSON.parse(xhr.responseText);
        var village = response.display_name;

        var li = document.createElement('li');
        li.innerHTML = village;
        locationsList.appendChild(li);
    }
}

function findMiddlePoint() {
    if (markers.length === 0) {
        alert("Please add at least one marker first!");
        return;
    }

    // calculate the center point of all the markers
    var latitudes = markers.map(function (marker) {
        return ol.proj.toLonLat(marker.getGeometry().getCoordinates())[1];
    });
    var longitudes = markers.map(function (marker) {
        return ol.proj.toLonLat(marker.getGeometry().getCoordinates())[0];
    });
    var lat = latitudes.reduce(function (sum, value) {
        return sum + value;
    }, 0) / latitudes.length;
    var lng = longitudes.reduce(function (sum, value) {
        return sum + value;
    }, 0) / longitudes.length;
    var center = ol.proj.fromLonLat([lng, lat]);

    // reverse geocode the coordinates of the center point to get the village name
    var village = getVillageName(lng, lat);

    // center the map on the calculated location
    map.getView().setCenter(center);
    map.getView().setZoom(16);

    // display the village name in an alert
    setTimeout(function () {
        alert("The middle point is at " + village);
    }, 500);
    let url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&zoom=14}`;

    // Update the href attribute of the link
    var gmapsLink = document.getElementById('open-gmaps-link');
    gmapsLink.href = url;
  
    // Show the link
    const element = document.getElementById('open-gmaps-link'); // replace with your element's ID
    element.style.display = 'inline-block';

    gmapsLink.style.display = 'inline-block';
}
  
    
  

document.addEventListener('DOMContentLoaded', function () {
    initMap();
    document.getElementById('find-middle-point-button').addEventListener('click', findMiddlePoint);
});

document.getElementById('reload-button').addEventListener('click', function () {
    location.reload();
});

