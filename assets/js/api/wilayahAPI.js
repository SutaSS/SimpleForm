const BASE_URL = "https://ibnux.github.io/data-indonesia";

/**
 * Fetch semua provinsi
 * @returns {Promise<Array>}
 */
async function fetchProvinsi() {
  const response = await fetch(`${BASE_URL}/provinsi.json`);
  if (!response.ok) throw new Error("Gagal fetch provinsi");
  return response.json();
}

/**
 * Fetch kabupaten/kota berdasarkan ID provinsi
 * @param {string|number} idProvinsi
 * @returns {Promise<Array>}
 */
async function fetchKabupatenByProvinsi(idProvinsi) {
  const response = await fetch(
    `${BASE_URL}/kabupaten/${idProvinsi}.json`
  );
  if (!response.ok) throw new Error("Gagal fetch kabupaten");
  return response.json();
}

/**
 * Fetch kecamatan berdasarkan ID kabupaten/kota
 * @param {string|number} idKabupaten
 * @returns {Promise<Array>}
 */
async function fetchKecamatanByKabupaten(idKabupaten) {
  const response = await fetch(
    `${BASE_URL}/kecamatan/${idKabupaten}.json`
  );
  if (!response.ok) throw new Error("Gagal fetch kecamatan");
  return response.json();
}

/**
 * Fetch kelurahan berdasarkan ID kecamatan
 * @param {string|number} idKecamatan
 * @returns {Promise<Array>}
 */
async function fetchKelurahanByKecamatan(idKecamatan) {
  const response = await fetch(
    `${BASE_URL}/kelurahan/${idKecamatan}.json`
  );
  if (!response.ok) throw new Error("Gagal fetch kelurahan");
  return response.json();
}

