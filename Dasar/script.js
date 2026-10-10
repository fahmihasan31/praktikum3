 // ===== 1. Variabel & State =====
    let angkaSekarang = "0"; // angka yang sedang diketik (string)
    let angkaSebelum = ""; // angka pertama sebelum operator dipilih
    let operatorAktif = null; // "+", "-", "*", "/" atau null
    let siapReset = false; // true setelah menekan "=" agar angka baru menimpa hasil
    let daftarRiwayat = []; // Array untuk menyimpan riwayat perhitungan

    const SIMBOL = {"+": "+", "-": "−", "*": "×", "/": "÷"};

    // ===== 2. Mengambil elemen DOM =====
    const hasilNode = document.getElementById("hasil");
    const riwayatNode = document.getElementById("riwayat");
    const tombolGridNode = document.getElementById("tombolGrid");
    const daftarRiwayatNode = document.getElementById("daftarRiwayat");
    const hapusRiwayatNode = document.getElementById("hapusRiwayat");

    // ===== 3. Fungsi tampilan =====
    const formatTampilan = (nilai) => nilai.replace(".", ",");

    const perbaruiLayar = () => {
      hasilNode.textContent = formatTampilan(angkaSekarang);
      riwayatNode.textContent = operatorAktif
        ? `${formatTampilan(angkaSebelum)} ${SIMBOL[operatorAktif]}`
        : "";
    };

    const gambarRiwayat = () => {
      if (daftarRiwayat.length === 0) {
        daftarRiwayatNode.innerHTML =
          '<li class="kosong">Belum ada perhitungan.</li>';
        return;
      }
      daftarRiwayatNode.innerHTML = "";
      // Perulangan FOR OF untuk menampilkan array (terbaru di atas)
      for (let item of daftarRiwayat) {
        const li = document.createElement("li");
        li.textContent = item;
        daftarRiwayatNode.appendChild(li);
      }
    };

    // ===== 4. Fungsi perhitungan =====
    const hitung = (a, b, operator) => {
      const x = parseFloat(a);
      const y = parseFloat(b);
      let hasil;

      // SWITCH untuk memilih operasi
      switch (operator) {
        case "+":
          hasil = x + y;
          break;
        case "-":
          hasil = x - y;
          break;
        case "*":
          hasil = x * y;
          break;
        case "/":
          if (y === 0) {
            return null; // pembagian dengan nol tidak diperbolehkan
          }
          hasil = x / y;
          break;
        default:
          return y;
      }
      // Dibulatkan agar 0.1 + 0.2 tidak tampil 0.30000000000000004
      return parseFloat(hasil.toFixed(10));
    };

    const tampilkanError = (pesan) => {
      angkaSekarang = "0";
      angkaSebelum = "";
      operatorAktif = null;
      perbaruiLayar();
      riwayatNode.textContent = pesan;
      siapReset = true;
    };

    // ===== 5. Fungsi aksi tombol =====
    const masukkanAngka = (angka) => {
      if (siapReset) {
        angkaSekarang = "0";
        siapReset = false;
      }
      if (angkaSekarang.replace(/[-.]/g, "").length >= 15) return; // batasi panjang
      angkaSekarang = angkaSekarang === "0" ? angka : angkaSekarang + angka;
      perbaruiLayar();
    };

    const masukkanDesimal = () => {
      if (siapReset) {
        angkaSekarang = "0";
        siapReset = false;
      }
      if (!angkaSekarang.includes(".")) {
        angkaSekarang += ".";
      }
      perbaruiLayar();
    };

    const pilihOperator = (operator) => {
      // Jika sudah ada operator & angka kedua sudah diketik, hitung dulu
      if (operatorAktif && !siapReset) {
        const hasil = hitung(angkaSebelum, angkaSekarang, operatorAktif);
        if (hasil === null) {
          tampilkanError("Tidak bisa dibagi nol");
          return;
        }
        angkaSebelum = String(hasil);
      } else {
        angkaSebelum = angkaSekarang;
      }
      operatorAktif = operator;
      angkaSekarang = angkaSebelum;
      siapReset = true;
      perbaruiLayar();
    };

    const hitungSamaDengan = () => {
      if (!operatorAktif) return;

      const hasil = hitung(angkaSebelum, angkaSekarang, operatorAktif);
      if (hasil === null) {
        tampilkanError("Tidak bisa dibagi nol");
        return;
      }

      const ekspresi = `${formatTampilan(angkaSebelum)} ${SIMBOL[operatorAktif]} ${formatTampilan(angkaSekarang)} = ${formatTampilan(String(hasil))}`;
      daftarRiwayat.unshift(ekspresi);
      gambarRiwayat();

      angkaSekarang = String(hasil);
      angkaSebelum = "";
      operatorAktif = null;
      siapReset = true;
      perbaruiLayar();
      riwayatNode.textContent = ekspresi.split(" = ")[0] + " =";
    };

    const bersihkan = () => {
      angkaSekarang = "0";
      angkaSebelum = "";
      operatorAktif = null;
      siapReset = false;
      perbaruiLayar();
    };

    const hapusSatu = () => {
      if (siapReset) return;
      angkaSekarang =
        angkaSekarang.length > 1 && angkaSekarang !== "-0"
          ? angkaSekarang.slice(0, -1)
          : "0";
      perbaruiLayar();
    };

    const hitungPersen = () => {
      angkaSekarang = String(parseFloat(angkaSekarang) / 100);
      perbaruiLayar();
    };

    // ===== 6. Event Listener =====
    // Satu listener di container tombol (event delegation)
    tombolGridNode.addEventListener("click", (e) => {
      const tombol = e.target.closest("button");
      if (!tombol) return;

      const {angka, operator, aksi} = tombol.dataset;

      if (angka !== undefined) masukkanAngka(angka);
      else if (operator) pilihOperator(operator);
      else if (aksi === "desimal") masukkanDesimal();
      else if (aksi === "sama") hitungSamaDengan();
      else if (aksi === "clear") bersihkan();
      else if (aksi === "hapus") hapusSatu();
      else if (aksi === "persen") hitungPersen();
    });

    hapusRiwayatNode.addEventListener("click", () => {
      daftarRiwayat = [];
      gambarRiwayat();
    });

    // Dukungan keyboard
    document.addEventListener("keydown", (e) => {
      if (e.key >= "0" && e.key <= "9") masukkanAngka(e.key);
      else if (["+", "-", "*", "/"].includes(e.key)) {
        e.preventDefault();
        pilihOperator(e.key);
      } else if (e.key === "." || e.key === ",") masukkanDesimal();
      else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        hitungSamaDengan();
      } else if (e.key === "Backspace") hapusSatu();
      else if (e.key === "Escape") bersihkan();
      else if (e.key === "%") hitungPersen();
    });

    perbaruiLayar();