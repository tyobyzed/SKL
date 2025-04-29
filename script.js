// Fungsi untuk memvalidasi jam akses (hanya bisa diakses pada jam tertentu)
function validJamAkses() {
    const now = new Date();
    const jam = now.getHours(); // 0-23 format
    return jam >= 15 && jam <= 23; // hanya boleh akses jam 15:00 - 23:00
}

// Load data dari Google Sheets melalui API
async function cekKelulusan() {
    if (!validJamAkses()) {
        alert('Akses hanya diperbolehkan antara jam 15:00 dan 23:00');
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
    const url = `https://opensheet.elk.sh/${sheetId}/Sheet1`; // Menggunakan opensheet.elk.sh untuk baca Sheet

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
            // Simpan data untuk PDF
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
