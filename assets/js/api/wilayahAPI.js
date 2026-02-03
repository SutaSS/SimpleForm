const BASE_URL = "https://ibnux.github.io/data-indonesia";

async function fetchProvinsi() {
  const response = await fetch(`${BASE_URL}/provinsi.json`);
  return response.json();
}

async function fetchKotaByProvinsi(idProvinsi) {
  const response = await fetch(
    `${BASE_URL}/kabupaten/${idProvinsi}.json`
  );
  return response.json();
}
