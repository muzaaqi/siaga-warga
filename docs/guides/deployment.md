# Panduan Deployment SiagaWarga

Dokumen ini memuat panduan lengkap penerapan (deployment) aplikasi SiagaWarga ke lingkungan produksi. Tersedia dua pilihan metode utama:

1. **Metode A: Cloudflare Workers (Edge Serverless)** — Direkomendasikan untuk latensi rendah di seluruh Indonesia dengan infrastruktur tanpa server.
2. **Metode B: Docker Container dengan Runtime Bun** — Direkomendasikan untuk VPS mandiri (self-hosted), server lokal, atau platform berbasis kontainer (Coolify, Dokku, Portainer, Kubernetes).
3. **Metode C: Systemd Service (Bare-Metal Bun)** — Menjalankan server Bun secara langsung di mesin Linux tanpa kontainer.

---

## 1. Persiapan Layanan Eksternal & Basis Data

Sebelum melakukan deployment pada metode apa pun, pastikan layanan eksternal berikut telah dikonfigurasi:

### 1.1 Database Neon PostgreSQL dengan PostGIS

1. Buat proyek basis data baru di [Neon Console](https://console.neon.tech/).
2. Aktifkan ekstensi PostGIS melalui SQL Editor di Neon Console:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Salin connection string PostgreSQL dengan mode SSL aktif, contoh:
   ```
   postgresql://user:password@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Terapkan skema tabel ke basis data produksi dari mesin lokal:
   ```bash
   bun run db:push
   # atau jika menggunakan file migrasi:
   bun run db:migrate
   ```

### 1.2 Cloudflare R2 Bucket (Penyimpanan Bukti Foto)

1. Buka Cloudflare Dashboard > **R2 Object Storage**.
2. Buat bucket baru dengan nama `siagawarga-evidence` (atau nama pilihan Anda).
3. Buat API Token R2 dengan izin **Object Read & Write**:
   - Catat `Account ID`, `Access Key ID`, dan `Secret Access Key`.
4. Aktifkan **Public Access** atau hubungkan Custom Domain ke bucket untuk mendapatkan `R2_PUBLIC_URL` (misalnya `https://pub-xyz.r2.dev` atau `https://cdn-evidence.domainanda.com`).
5. Atur aturan CORS pada bucket R2 agar browser dapat mengunggah file langsung via Presigned PUT URL:
   ```json
   [
     {
       "AllowedOrigins": ["https://siagawarga.domainanda.com", "http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### 1.3 NASA FIRMS API Key

1. Daftarkan akun secara gratis di [NASA FIRMS API Map Key](https://firms.modaps.eosdis.nasa.gov/api/map_key).
2. Salin 32 karakter Map Key yang dikirimkan melalui email.

---

## 2. Metode A: Deployment ke Cloudflare Workers

Aplikasi SiagaWarga menggunakan TanStack Start dengan integrasi `@cloudflare/vite-plugin` yang menghasilkan artefak siap pakai untuk Cloudflare Workers.

### Langkah 1: Autentikasi Wrangler

Pastikan Wrangler CLI terautentikasi dengan akun Cloudflare Anda:

```bash
bunx wrangler login
```

Verifikasi autentikasi:

```bash
bunx wrangler whoami
```

### Langkah 2: Konfigurasi wrangler.jsonc

Periksa berkas `wrangler.jsonc` pada root proyek:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "siaga-warga",
  "compatibility_date": "2025-09-02",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry"
}
```

### Langkah 3: Daftarkan Environment Secrets ke Cloudflare Workers

Simpan seluruh variabel rahasia ke Cloudflare Workers secara aman melalui CLI:

```bash
bunx wrangler secret put DATABASE_URL
bunx wrangler secret put R2_ACCOUNT_ID
bunx wrangler secret put R2_ACCESS_KEY_ID
bunx wrangler secret put R2_SECRET_ACCESS_KEY
bunx wrangler secret put R2_BUCKET_NAME
bunx wrangler secret put R2_PUBLIC_URL
bunx wrangler secret put NASA_FIRMS_MAP_KEY
bunx wrangler secret put ADMIN_PASSCODE
bunx wrangler secret put SESSION_SECRET
```

Setiap perintah akan meminta Anda memasukkan nilai rahasia secara interaktif tanpa terekspos di terminal history.

### Langkah 4: Build dan Deploy

Jalankan perintah build dan deploy:

```bash
bun run build
bun run deploy
```

Wrangler akan mengunggah aset statis ke Cloudflare Assets dan mendeploy SSR worker ke jaringan global Cloudflare. Output terminal akan menampilkan URL deployment aktif (misal: `https://siaga-warga.subdomain.workers.dev`).

### Langkah 5: Hubungkan Custom Domain (Opsional)

1. Buka Cloudflare Dashboard > **Workers & Pages**.
2. Pilih worker `siaga-warga` > tab **Settings** > **Domains & Routes**.
3. Klik **Add Custom Domain** dan masukkan domain Anda (misal: `siagawarga.id`).

### Langkah 6: Pemantauan Log Real-time

Untuk memantau log worker yang sedang berjalan di produksi:

```bash
bunx wrangler tail
```

---

## 3. Metode B: Deployment Docker Container (Runtime Bun)

Metode ini menggunakan multi-stage build `Dockerfile` berbasis Alpine Linux dengan runtime native Bun (`oven/bun:1-alpine`). Server produksi ditenagai oleh `server.ts` yang menyajikan aset statis dengan in-memory preloading, kompresi Gzip, ETag, dan penanganan graceful shutdown.

### Langkah 1: Siapkan Server VPS

Pastikan server Anda (Ubuntu 22.04/24.04, Debian 12, dll.) telah terpasang:
- Docker Engine (v24+)
- Docker Compose (v2+)
- Git

### Langkah 2: Clone Repository dan Atur File Lingkungan

```bash
git clone https://github.com/muzaaqi/siaga-warga.git /var/www/siaga-warga
cd /var/www/siaga-warga
cp .env.example .env
nano .env
```

Isi seluruh nilai environment variable di dalam `.env`:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=siagawarga-evidence
R2_PUBLIC_URL=https://pub-xyz.r2.dev
NASA_FIRMS_MAP_KEY=your-nasa-firms-map-key
ADMIN_PASSCODE=your-secure-admin-passcode
SESSION_SECRET=super-secret-crypto-key-at-least-32-chars
```

### Langkah 3: Jalankan Menggunakan Docker Compose

Jalankan kontainer di latar belakang:

```bash
docker compose up -d --build
```

Periksa status kontainer:

```bash
docker compose ps
```

Lihat log jalannya aplikasi:

```bash
docker compose logs -f app
```

### Langkah 4: Pembaruan Versi Aplikasi (Update & Redeploy)

Saat ada pembaruan kode di branch utama:

```bash
cd /var/www/siaga-warga
git pull origin main
docker compose up -d --build
```

### Langkah 5: Konfigurasi Reverse Proxy & SSL (HTTPS)

Aplikasi berjalan pada port internal `3000`. Gunakan Nginx atau Caddy sebagai reverse proxy publik dengan sertifikat SSL gratis dari Let's Encrypt.

#### Pilihan 1: Menggunakan Caddy (Paling Mudah, SSL Otomatis)

Pasang Caddy di VPS, lalu edit `/etc/caddy/Caddyfile`:

```caddyfile
siagawarga.domainanda.com {
    reverse_proxy localhost:3000
}
```

Muat ulang konfigurasi Caddy:

```bash
sudo systemctl reload caddy
```

Caddy akan otomatis mendaftarkan dan memperbarui sertifikat SSL Let's Encrypt.

#### Pilihan 2: Menggunakan Nginx + Certbot

Buat konfigurasi virtual host di `/etc/nginx/sites-available/siagawarga`:

```nginx
server {
    server_name siagawarga.domainanda.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi dan pasang sertifikat SSL:

```bash
sudo ln -s /etc/nginx/sites-available/siagawarga /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d siagawarga.domainanda.com
```

---

## 4. Metode C: Systemd Service (Bare-Metal Bun)

Jika Anda ingin menjalankan aplikasi langsung pada VPS tanpa lapisan kontainer Docker:

### Langkah 1: Pasang Bun di VPS

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### Langkah 2: Setup Proyek dan Build

```bash
cd /var/www/siaga-warga
bun install --frozen-lockfile
bun run build
```

### Langkah 3: Buat Unit File Systemd

Buat berkas layanan di `/etc/systemd/system/siagawarga.service`:

```ini
[Unit]
Description=SiagaWarga Production Server (Bun Runtime)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/siaga-warga
ExecStart=/root/.bun/bin/bun run server.ts
Restart=always
RestartSec=5
EnvironmentFile=/var/www/siaga-warga/.env

[Install]
WantedBy=multi-user.target
```

### Langkah 4: Aktifkan dan Jalankan Layanan

```bash
sudo systemctl daemon-reload
sudo systemctl enable siagawarga
sudo systemctl start siagawarga
sudo systemctl status siagawarga
```

Untuk memantau log aplikasi:

```bash
journalctl -u siagawarga -f
```

---

## 5. Diagnostik dan Pemecahan Masalah (Troubleshooting)

### Koneksi Basis Data Neon Gagal / Timeout
- Pastikan parameter `?sslmode=require` disertakan pada connection string `DATABASE_URL`.
- Periksa IP allowlist pada Neon Console jika fitur pembatasan IP diaktifkan.
- Pastikan ekstensi `postgis` telah diaktifkan sebelum menjalankan migrasi.

### Foto Gagal Diunggah ke R2 (CORS Error)
- Pastikan domain publik aplikasi (`https://siagawarga.domainanda.com`) telah didaftarkan dalam aturan `AllowedOrigins` pada konfigurasi CORS bucket Cloudflare R2.
- Pastikan metode HTTP `PUT` diizinkan dalam aturan CORS.

### Port 3000 Sudah Digunakan
- Ubah port di file `.env` (misalnya `PORT=8080`) atau pada `docker-compose.yml` pada bagian port mapping (`"8080:3000"`).

### Kontainer Lambat Berhenti (Graceful Shutdown)
- Skrip `server.ts` telah dilengkapi penanganan sinyal `SIGTERM` dan `SIGINT`. Jika kontainer dijalankan langsung via docker run, pastikan proses Bun berjalan sebagai PID 1 atau gunakan flag `--init` (`docker run --init ...`).
