async function initForm() {
  const $provinsi = $("#provinsi");
  const $kota = $("#kota");

  $kota.prop("disabled", true);

  /* ======================
     LOAD PROVINSI
  ====================== */
  try {
    const provinsiList = await fetchProvinsi();
    provinsiList.forEach((prov) => {
      $provinsi.append(`<option value="${prov.id}">${prov.nama}</option>`);
    });
  } catch {
    alert("Gagal memuat data provinsi");
  }

  /* ======================
     PROVINSI CHANGE
  ====================== */
  $provinsi.on("change", async function () {
    const idProv = $(this).val();
    const provinsiText = $("#provinsi option:selected").text();

    $kota.html(`<option value="">Pilih Kota / Kabupaten</option>`);
    $kota.prop("disabled", true);

    if (!idProv) return;

    zoomToLocation(`${provinsiText}, Indonesia`, 7);

    try {
      const kabList = await fetchKabupatenByProvinsi(idProv);
      kabList.forEach((kab) => {
        $kota.append(`<option value="${kab.id}">${kab.nama}</option>`);
      });
      $kota.prop("disabled", false);
    } catch {
      alert("Gagal memuat kota/kabupaten");
    }
  });

  $kota.on("change", function () {
    const kotaText = $("#kota option:selected").text();
    const provinsiText = $("#provinsi option:selected").text();

    if (!kotaText) return;

    zoomToLocation(`${kotaText}, ${provinsiText}, Indonesia`, 11);
  });

  /* ======================
     SUBMIT
  ====================== */
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();

    const nama = $("#nama").val().trim();
    const subject = $("#subject").val();
    const provinsiText = $("#provinsi option:selected").text();
    const kotaText = $("#kota option:selected").text();
    const message = $("#message").val().trim();

    const { lat, lng } = window.selectedLocation;

    if (!lat || !lng) {
      alert("Lokasi belum ditentukan di map");
      return;
    }

    const text = `
Halo! saya ${nama}
Subject: ${subject}
Domisili: ${kotaText}, ${provinsiText}
Lokasi: https://maps.google.com/?q=${lat},${lng}

${message}
`;

    const url = `https://wa.me/6281459159179?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  });
}
