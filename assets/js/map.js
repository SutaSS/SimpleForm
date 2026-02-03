window.selectedLocation = {
  lat: null,
  lng: null
};

let map;
let marker;

function initMap() {
  map = L.map("map").setView([-2.5, 118], 5); // Indonesia view

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  marker = L.marker([-2.5, 118], {
    draggable: true
  }).addTo(map);

  window.selectedLocation.lat = -2.5;
  window.selectedLocation.lng = 118;

  marker.on("dragend", function () {
    const pos = marker.getLatLng();
    window.selectedLocation.lat = pos.lat;
    window.selectedLocation.lng = pos.lng;
  });
}

async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Lokasi tidak ditemukan");
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

/* =========================
   ZOOM KE LOKASI (GLOBAL)
========================= */
async function zoomToLocation(query, zoomLevel) {
  try {
    const { lat, lng } = await geocodeLocation(query);
    map.setView([lat, lng], zoomLevel);

    marker.setLatLng([lat, lng]);
    window.selectedLocation.lat = lat;
    window.selectedLocation.lng = lng;
  } catch (error) {
    console.error(error);
  }
}

marker.on("dragend", async function () {
  const pos = marker.getLatLng();

  window.selectedLocation.lat = pos.lat;
  window.selectedLocation.lng = pos.lng;

  try {
    const address = await reverseGeocode(pos.lat, pos.lng);

    $("#address").val(address.full);
  } catch (err) {
    console.error("Gagal mengambil alamat");
  }
});

