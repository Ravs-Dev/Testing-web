const form = document.getElementById("formNilai");
const inputNilai = document.getElementById("nilai");
const hasil = document.getElementById("hasil");

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const nilai = Number(inputNilai.value);

  // Validasi input
  if (nilai < 0 || nilai > 100 || inputNilai.value === "") {
    hasil.className = "hasil gagal";
    hasil.textContent = "Masukkan nilai antara 0 sampai 100.";
    return;
  }

  // Percabangan sesuai flowchart
  if (nilai >= 75) {
    hasil.className = "hasil lulus";
    hasil.innerHTML = `🎉 LULUS!<br>Nilai kamu: ${nilai}`;
  } else {
    hasil.className = "hasil gagal";
    hasil.innerHTML = `❌ TIDAK LULUS<br>Nilai kamu: ${nilai}`;
  }
});
