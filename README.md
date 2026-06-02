# SPK Penentuan Tingkat Kesiapan Akreditasi Program Studi

Sistem Pendukung Keputusan (SPK) untuk menentukan tingkat kesiapan akreditasi Program Studi Teknik di Institut Teknologi Kalimantan berdasarkan kriteria LAM Teknik menggunakan metode **Analytic Hierarchy Process (AHP)**.

## Tech Stack

- **Frontend**: React.js (Vite) + Tailwind CSS v3
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14

### Database Setup

```bash
# Create database
createdb spk_akreditasi

# Run schema
psql -d spk_akreditasi -f backend/database/schema.sql

# Run seed data
psql -d spk_akreditasi -f backend/database/seed.sql
```

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Struktur Kriteria LAM Teknik

1. Tata Pamong
2. Mahasiswa
3. Sumber Daya Manusia
4. Keuangan dan Sarana Prasarana
5. Pendidikan
6. Penelitian
7. Pengabdian kepada Masyarakat
8. Luaran dan Capaian

## License

MIT
