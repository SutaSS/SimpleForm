window.selectedLocation = {
  lat: null,
  lng: null,
};

let map;
let marker;

function initMap() {
  map = L.map("map").setView([-2.5, 118], 5); // Indonesia view

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  marker = L.marker([-2.5, 118], {
    draggable: true,
  }).addTo(map);

  window.selectedLocation.lat = -2.5;
  window.selectedLocation.lng = 118;

  marker.on("dragend", async function () {
    const pos = marker.getLatLng();

    window.selectedLocation.lat = pos.lat;
    window.selectedLocation.lng = pos.lng;

    try {
      const addr = await reverseGeocode(pos.lat, pos.lng);

      const alamatLengkap = [
        addr.road,
        addr.houseNumber,
        addr.neighbourhood,
        addr.city,
        addr.province,
      ]
        .filter(Boolean)
        .join(", ");

      $("#address").val(alamatLengkap);
      
      const provinceIndo = translateProvinceName(addr.province);
      await autoSelectProvinsiKota(provinceIndo, addr.city);
    } catch (e) {
      console.error(e);
    }
  });
}


async function forwardGeocode(addressText) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    addressText
  )}&addressdetails=1&limit=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Alamat tidak ditemukan");
  }

  const addr = data[0].address;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    province: addr.state || addr.province || "",
    city:
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      "",
    full: data[0].display_name,
  };
}


async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query,
  )}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Lokasi tidak ditemukan");
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
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

// Helper: Reverse geocode untuk ambil alamat, provinsi, kota
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data || !data.address) {
    throw new Error("Alamat tidak ditemukan");
  }

  const a = data.address;

  return {
    // Alamat lengkap
    full: data.display_name,

    // Jalan & detail
    road: a.road || a.residential || a.pedestrian || "",
    houseNumber: a.house_number || "",
    neighbourhood: a.neighbourhood || a.suburb || "",
    village: a.village || "",
    district: a.city_district || a.county || "",

    // Kota & provinsi
    city: a.city || a.town || a.municipality || a.county || "",
    province: a.state || "",

    postcode: a.postcode || "",
  };
}

// Mapping nama provinsi dari Nominatim (English) ke Bahasa Indonesia
function translateProvinceName(engName) {
  const provinceMapping = {
  // Sumatera
  "Aceh": "Aceh",
  "North Sumatra": "Sumatera Utara",
  "West Sumatra": "Sumatera Barat",
  "Riau": "Riau",
  "Jambi": "Jambi",
  "South Sumatra": "Sumatera Selatan",
  "Bengkulu": "Bengkulu",
  "Lampung": "Lampung",
  "Bangka Belitung": "Kepulauan Bangka Belitung",
  "Bangka-Belitung Islands": "Kepulauan Bangka Belitung",
  "Riau Islands": "Kepulauan Riau",

  // Jawa
  "Jakarta": "DKI Jakarta",
  "Special Capital Region of Jakarta": "DKI Jakarta",
  "West Java": "Jawa Barat",
  "Central Java": "Jawa Tengah",
  "East Java": "Jawa Timur",
  "Banten": "Banten",
  "Yogyakarta": "DI Yogyakarta",
  "Special Region of Yogyakarta": "DI Yogyakarta",

  // Bali & Nusa Tenggara
  "Bali": "Bali",
  "West Nusa Tenggara": "Nusa Tenggara Barat",
  "East Nusa Tenggara": "Nusa Tenggara Timur",

  // Kalimantan
  "West Kalimantan": "Kalimantan Barat",
  "Central Kalimantan": "Kalimantan Tengah",
  "South Kalimantan": "Kalimantan Selatan",
  "East Kalimantan": "Kalimantan Timur",
  "North Kalimantan": "Kalimantan Utara",

  // Sulawesi
  "North Sulawesi": "Sulawesi Utara",
  "Central Sulawesi": "Sulawesi Tengah",
  "South Sulawesi": "Sulawesi Selatan",
  "Southeast Sulawesi": "Sulawesi Tenggara",
  "Gorontalo": "Gorontalo",
  "West Sulawesi": "Sulawesi Barat",

  // Maluku & Papua (Termasuk Provinsi Baru)
  "Maluku": "Maluku",
  "North Maluku": "Maluku Utara",
  "Papua": "Papua",
  "West Papua": "Papua Barat",
  "South Papua": "Papua Selatan",
  "Central Papua": "Papua Tengah",
  "Highland Papua": "Papua Pegunungan",
  "Southwest Papua": "Papua Barat Daya"
};
  
  return provinceMapping[engName] || engName;
}

// Auto-select provinsi dan kota di dropdown berdasarkan nama
async function autoSelectProvinsiKota(provinceName, cityName) {
  if (!provinceName) return;
  
  try {
    const $provinsi = $("#provinsi");
    const $kota = $("#kota");
    
    // Cari dan select provinsi
    let provinsiId = null;
    $provinsi.find("option").each(function() {
      const optionText = $(this).text().trim();
      if (optionText.toLowerCase() === provinceName.toLowerCase()) {
        provinsiId = $(this).val();
        $provinsi.val(provinsiId);
        return false; // break
      }
    });
    
    if (!provinsiId) {
      console.warn(`Provinsi "${provinceName}" tidak ditemukan di dropdown`);
      return;
    }
    
    // Load kota berdasarkan provinsi yang dipilih
    try {
      const kabList = await fetchKabupatenByProvinsi(provinsiId);
      $kota.html(`<option value="">Pilih Kota / Kabupaten</option>`);
      
      let kotaMatched = false;
      kabList.forEach((kab) => {
        $kota.append(`<option value="${kab.id}">${kab.nama}</option>`);
        
        // Coba match dengan nama kota
        if (cityName && !kotaMatched) {
          const kabNama = kab.nama.toLowerCase();
          const cityLower = cityName.toLowerCase();
          
          // Match: exact, contains, atau kota contains input
          if (kabNama === cityLower || 
              kabNama.includes(cityLower) || 
              cityLower.includes(kabNama)) {
            $kota.val(kab.id);
            kotaMatched = true;
          }
        }
      });
      
      $kota.prop("disabled", false);
      
      if (!kotaMatched && cityName) {
        console.warn(`Kota "${cityName}" tidak ditemukan, silakan pilih manual`);
      }
    } catch (err) {
      console.error("Gagal load kota/kabupaten:", err);
    }
  } catch (err) {
    console.error("Error di autoSelectProvinsiKota:", err);
  }
}
// Event listener untuk input address - geocoding otomatis
$(document).ready(function() {
  let addressTimeout;
  
  $("#address").on("input", function() {
    clearTimeout(addressTimeout);
    const addressText = $(this).val().trim();
    
    if (addressText.length < 5) return; 
    
    addressTimeout = setTimeout(async () => {
      try {
        console.log("Forward geocoding:", addressText);
        const result = await forwardGeocode(addressText);
        
        console.log("Geocoding result:", result);
        
        marker.setLatLng([result.lat, result.lng]);
        map.setView([result.lat, result.lng], 15);
        
        window.selectedLocation.lat = result.lat;
        window.selectedLocation.lng = result.lng;
        
        const provinceIndo = translateProvinceName(result.province);
        await autoSelectProvinsiKota(provinceIndo, result.city);
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    }, 1000);
  });
});