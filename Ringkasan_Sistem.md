# Rangkuman Sistem: SPK Penentuan Tingkat Kesiapan Akreditasi Program Studi

Sistem ini adalah **Sistem Pendukung Keputusan (SPK)** yang dirancang untuk menentukan tingkat kesiapan akreditasi Program Studi Teknik di Institut Teknologi Kalimantan. Sistem ini mengevaluasi kesiapan berdasarkan kriteria dari **LAM Teknik** dengan menggunakan metode **Analytic Hierarchy Process (AHP)**.

## 1. Arsitektur Sistem
Sistem dibangun menggunakan arsitektur *Client-Server*, yang berarti bagian antarmuka pengguna (Frontend) dan pemrosesan data serta logika bisnis (Backend) dipisahkan menjadi dua aplikasi independen yang saling berkomunikasi melalui RESTful API.

## 2. Teknologi yang Digunakan (Tech Stack)

### A. Bagian Frontend (Antarmuka Pengguna)
Frontend dibangun untuk memberikan antarmuka yang responsif dan interaktif bagi pengguna.
*   **Bahasa Pemrograman**: JavaScript (ES6+)
*   **Library Utama**: React.js (v19)
*   **Build Tool**: Vite (v8) - Digunakan untuk kompilasi dan proses *bundling* yang sangat cepat.
*   **Styling (Desain)**: Tailwind CSS (v3) beserta PostCSS dan Autoprefixer.
*   **Routing**: React Router DOM (v7) - Untuk mengelola navigasi halaman (Single Page Application).
*   **Visualisasi Data**: Recharts (v3) - Digunakan untuk membuat grafik interaktif dari hasil perhitungan AHP.
*   **Export Dokumen**: jsPDF & jsPDF-AutoTable - Memungkinkan pengguna untuk mengunduh laporan ke dalam format PDF.

### B. Bagian Backend (Server & API)
Backend bertanggung jawab untuk mengelola koneksi ke database, melakukan perhitungan matriks AHP, dan melayani permintaan dari Frontend.
*   **Environment**: Node.js (v18+)
*   **Bahasa Pemrograman**: JavaScript
*   **Framework Utama**: Express.js (v4.21) - Digunakan untuk membangun RESTful API.
*   **Validasi Data**: express-validator - Untuk memvalidasi input data kriteria dan alternatif yang dikirimkan oleh pengguna.
*   **Modul Pendukung**:
    *   `cors`: Untuk mengatur akses *Cross-Origin Resource Sharing* agar Frontend bisa berkomunikasi dengan Backend.
    *   `dotenv`: Mengelola variabel lingkungan yang sensitif (seperti kredensial database).

### C. Database (Penyimpanan Data)
*   **Sistem Manajemen Basis Data**: PostgreSQL (v14+)
*   **Driver**: `pg` (node-postgres) - Penghubung antara aplikasi Node.js dan database PostgreSQL.

### D. Deployment (Hosting)
*   **Target Platform**: Railway (berdasarkan dokumentasi awal sistem).

## 3. Metodologi SPK & Kriteria Penilaian
Sistem ini menggunakan metode pengambilan keputusan multi-kriteria **Analytic Hierarchy Process (AHP)**. Kriteria yang dievaluasi didasarkan pada 8 standar yang ditetapkan oleh **LAM Teknik**:
1.  Tata Pamong
2.  Mahasiswa
3.  Sumber Daya Manusia (SDM)
4.  Keuangan dan Sarana Prasarana
5.  Pendidikan
6.  Penelitian
7.  Pengabdian kepada Masyarakat
8.  Luaran dan Capaian
