// Fungsi untuk format tanggal Indonesia
function formatTanggalIndo({ tanggal, bulan, tahun }) {
    const bulanIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Validasi angka bulan
    if (bulan < 1 || bulan > 12) {
        throw new Error(`Bulan tidak valid: ${bulan}. Harus antara 1 - 12.`);
    }

    // Validasi tanggal
    if (tanggal < 1 || tanggal > 31) {
        throw new Error(`Tanggal tidak valid: ${tanggal}. Harus antara 1 - 31.`);
    }

    return `${tanggal} ${bulanIndo[bulan - 1]} ${tahun}`;
}

// Fungsi untuk validasi jam dan tanggal akses
function validAkses() {
    const now = new Date();
    const jam = now.getHours(); // 0-23 format
    const tanggal = now.getDate(); // 1-31 format
    const bulan = now.getMonth() + 1; // 0-11 format
    const tahun = now.getFullYear();

    // Tanggal akses hanya 1 tanggal tertentu, misalnya 5 Mei 2025, jam 15:00
    const tanggalAkses = { tanggal: 5, bulan: 5, tahun: 2025 };
    const waktuAkses = new Date(tanggalAkses.tahun, tanggalAkses.bulan - 1, tanggalAkses.tanggal, 15, 0, 0); // jam 15.00

    // Cek apakah sekarang waktu yang valid untuk akses
    const aksesValid = now >= waktuAkses;

    return {
        aksesValid,
        tanggalAkses,
        waktuAkses
    };
}

// Fungsi untuk cek kelulusan
async function cekKelulusan() {
    const akses = validAkses();

    if (!akses.aksesValid) {
        const tanggalStr = formatTanggalIndo(akses.tanggalAkses);
        alert(`Akses hanya diperbolehkan mulai jam 15:00 tanggal ${tanggalStr}.`);
        return;
    }

    const nama = document.getElementById('nama').value.trim();
    const nisn = document.getElementById('nisn').value.trim();

    if (nama === '' || nisn === '') {
        alert('Nama dan NISN harus diisi!');
        return;
    }

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

// Membuat file PDF kelulusan
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const siswaData = JSON.parse(sessionStorage.getItem('siswaData'));

    doc.setFontSize(16);
    doc.text('SURAT KETERANGAN KELULUSAN', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text('Nomor Surat: 123/ABC/2025', 105, 30, null, null, 'center');

    doc.setFontSize(12);
    doc.text(`Nama: ${siswaData.Nama}`, 20, 50);
    doc.text(`NISN: ${siswaData.NISN}`, 20, 60);
    doc.text(`Kelas: ${siswaData.Kelas}`, 20, 70);
    doc.text(`Keterangan: ${siswaData.Keterangan.toUpperCase()}`, 20, 80);

    doc.text('Ditetapkan di: Nama Kota', 20, 100);
    doc.text(`Pada tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 110);

    doc.text('Kepala Sekolah,', 150, 140);
    doc.text('_________________', 145, 160);
    doc.text('Nama Kepala Sekolah', 145, 170);

    doc.save('Surat_Kelulusan.pdf');
}

// FUNGSI COUNTDOWN dan DISABLE TOMBOL
function setupCountdown() {
    const akses = validAkses();
    const now = new Date();
    const cekBtn = document.getElementById('cekBtn');
    const countdownDiv = document.getElementById('countdown');

    if (now < akses.waktuAkses) {
        cekBtn.disabled = true;

        const interval = setInterval(() => {
            const now = new Date();
            const selisih = akses.waktuAkses - now;

            if (selisih <= 0) {
                countdownDiv.innerHTML = 'Akses sudah dibuka!';
                cekBtn.disabled = false;
                clearInterval(interval); // penting, agar tidak terus berjalan
                return;
            }

            const days = Math.floor(selisih / (1000 * 60 * 60 * 24));
            const hours = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((selisih % (1000 * 60)) / 1000);

            countdownDiv.innerHTML = `Akses dibuka dalam: ${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik.`;
        }, 1000);
    } else {
        cekBtn.disabled = false;
        countdownDiv.innerHTML = '';
    }
}

// Jalankan setupCountdown saat halaman selesai loading
window.onload = setupCountdown;
