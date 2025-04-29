// Fungsi untuk validasi jam dan tanggal akses
function validAkses() {
    const jam = now.getHours(); // 0-23 format
    const tanggal = now.getDate(); // 1-31 format
    const bulan = now.getMonth() + 1; // 0-11 format, jadi +1
    const tahun = now.getFullYear();

    // Aturan jam akses
    const jamValid = jam >= 15 && jam <= 23;

    // Aturan tanggal akses
    const tanggalMulai = { tanggal: 5, bulan: 5, tahun: 2025 }; // Contoh: 29 April 2025
    const tanggalSelesai = { tanggal: 6, bulan: 5, tahun: 2025 }; // Contoh: 5 Mei 2025

    const mulai = new Date(tanggalMulai.tahun, tanggalMulai.bulan - 1, tanggalMulai.tanggal);
    const selesai = new Date(tanggalSelesai.tahun, tanggalSelesai.bulan - 1, tanggalSelesai.tanggal);

    const today = new Date(tahun, bulan - 1, tanggal);

    const tanggalValid = today >= mulai && today <= selesai;

    return jamValid && tanggalValid;
}

// Load data dari Google Sheets melalui API
async function cekKelulusan() {
    if (!validAkses()) {
        alert('Akses hanya diperbolehkan antara jam 15:00 - 23:00 dan tanggal 29 April 2025 sampai 5 Mei 2025.');
        return;
    }

    const nama = document.getElementById('nama').value.trim();
    const nisn = document.getElementById('nisn').value.trim();

    if (nama === '' || nisn === '') {
        alert('Nama dan NISN harus diisi!');
        return;
    }

    // URL API untuk mengambil data sebagai JSON
    const sheetId = '1ghbYznlzdwBWl1OEGLn6IB_tV7V60JnUITAdhoOtCeg';
    const url = `https://opensheet.elk.sh/${sheetId}/Sheet1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        let ditemukan = false;
        let siswaData = {};

        data.forEach(item => {
            if (item.Nama?.toLowerCase() === nama.toLowerCase() && item.NISN === nisn) {
                ditemukan = true;
                siswaData = item;
            }
        });

        if (ditemukan) {
            if (siswaData.Keterangan.toLowerCase() === 'lulus') {
                document.getElementById('hasil').innerHTML = 'Selamat, Anda LULUS!';
                document.getElementById('downloadBtn').style.display = 'inline-block';
            } else {
                document.getElementById('hasil').innerHTML = 'Maaf, Anda TIDAK LULUS.';
                document.getElementById('downloadBtn').style.display = 'none';
            }
            sessionStorage.setItem('siswaData', JSON.stringify(siswaData));
        } else {
            document.getElementById('hasil').innerHTML = 'Data tidak ditemukan.';
            document.getElementById('downloadBtn').style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Gagal mengambil data. Pastikan koneksi internet Anda stabil.');
    }
}
