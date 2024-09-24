
# MAJOR Automation Script

Major Automation Script adalah skrip Node.js yang digunakan untuk mengotomatisasi berbagai tugas di platform Major. Skrip ini memungkinkan Anda untuk mengotomatisasi proses autentikasi, mendapatkan informasi pengguna, absensi, spin roulette, hold coins, swipe coins, dan menyelesaikan tugas harian.

## Fitur

- **Autentikasi**: Otomatisasi proses autentikasi menggunakan data inisialisasi.
- **Informasi Pengguna**: Mendapatkan dan menampilkan informasi pengguna termasuk jumlah bintang yang dimiliki.
- **Absensi**: Otomatisasi proses absensi dan menampilkan streak absensi.
- **Spin Roulette**: Otomatisasi spin roulette dan menampilkan hasil spin.
- **Hold Coins**: Otomatisasi proses hold coins dan menampilkan hasilnya.
- **Swipe Coins**: Otomatisasi proses swipe coins dan menampilkan hasilnya.
- **Tugas Harian**: Mendapatkan dan menyelesaikan tugas harian.
- **Teka-teki Durov**: Otomatisasi proses menemukan teka-teki Durov dan menampilkan hasilnya.

## Persyaratan

- Node.js (v14 atau lebih baru)
- npm atau yarn

## Instalasi

1. Clone repositori ini ke komputer Anda:

   ```bash
   git clone https://github.com/Getkodeku/Major.git
   cd repo
   ```

2. Instal dependensi yang diperlukan:

   ```bash
   npm install
   ```

   atau

   ```bash
   yarn install
   ```

## Konfigurasi

1. **Data Akun**: Buat file `data.txt` dengan setiap baris berisi data inisialisasi akun. Contoh:

   ```
   init_data_1
   init_data_2
   ```

2. **Proxy (Opsional)**: Jika Anda ingin menggunakan proxy, buat file `proxy.txt` di direktori root proyek dengan setiap baris berisi URL proxy. Contoh:

   ```
   http://proxy1.com:8080
   http://proxy2.com:8080
   ```

## Penggunaan

Jalankan skrip dengan perintah berikut:

```bash
node major.js
```

Skrip akan memproses setiap akun secara otomatis dan menampilkan hasilnya di konsol.

## Struktur Proyek

- `major.js`: File utama yang berisi logika utama skrip Tanpa proxy.
- `major-proxy.js`: Sama seperti `major.js` tetapi anda membutuhkan proxy.
- `data.txt`: File yang berisi data inisialisasi akun.
- `proxy.txt` (Opsional): File yang berisi URL proxy.
- `README.md`: File ini, berisi informasi tentang proyek.

## Kontribusi

Kontribusi selalu diterima! Jika Anda ingin berkontribusi, silakan buat _pull request_ atau laporkan _issue_ di repositori ini.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).