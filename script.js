// Fungsi untuk format tanggal Indonesia
function formatTanggalIndo({ tanggal, bulan, tahun }) {
    const bulanIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    if (bulan < 1 || bulan > 12 || tanggal < 1 || tanggal > 31) {
        return `${tanggal}-${bulan}-${tahun}`;
    }

    return `${tanggal} ${bulanIndo[bulan - 1]} ${tahun}`;
}

// Fungsi validasi akses waktu
function validAkses() {
    const now = new Date();
    const tanggalAkses = { tanggal: 3, bulan: 5, tahun: 2025 };
    const waktuAkses = new Date(tanggalAkses.tahun, tanggalAkses.bulan - 1, tanggalAkses.tanggal, 15, 0, 0);
    const aksesValid = now >= waktuAkses;

    return {
        aksesValid,
        tanggalAkses,
        waktuAkses
    };
}

// Fungsi cek kelulusan
async function cekKelulusan() {
    const akses = validAkses();

    if (!akses.aksesValid) {
        const tanggalStr = formatTanggalIndo(akses.tanggalAkses);
        alert(`Akses hanya diperbolehkan mulai jam 15:00 tanggal ${tanggalStr}.`);
        return;
    }

    const nisn = document.getElementById('nisn').value.trim();
    if (nisn === '') {
        alert('NISN harus diisi!');
        return;
    }

    const sheetId = '1ghbYznlzdwBWl1OEGLn6IB_tV7V60JnUITAdhoOtCeg';
    const url = `https://opensheet.elk.sh/${sheetId}/Sheet1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const siswa = data.find(item => item.NISN === nisn);

        const hasilDiv = document.getElementById('hasil');
        const downloadBtn = document.getElementById('downloadBtn');

        if (siswa) {
            sessionStorage.setItem('siswaData', JSON.stringify(siswa));

            if ((siswa.Keterangan || '').toLowerCase() === 'lulus') {
                hasilDiv.innerHTML = `<h2>Selamat ${siswa.Nama}!</h2><p>Status: <strong>LULUS</strong></p>`;
                downloadBtn.style.display = 'inline-block';
            } else {
                hasilDiv.innerHTML = `<h2>Mohon Maaf ${siswa.Nama}</h2><p>Status: <strong>TIDAK LULUS</strong></p>`;
                downloadBtn.style.display = 'none';
            }
        } else {
            hasilDiv.innerHTML = `<p style="color:red;">NISN tidak ditemukan.</p>`;
            downloadBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Gagal mengambil data. Pastikan koneksi internet Anda stabil.');
    }
}

// Fungsi generate PDF
function downloadPDF() {
    const { jsPDF
