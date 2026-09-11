# Panduan Publikasi Manual ke NPM

Dokumen ini menjelaskan langkah-langkah untuk mempublikasikan package **`n8n-nodes-repliz`** ke registry NPM secara manual melalui CLI terminal.

---

## 1. Prasyarat

Sebelum memulai, pastikan:
1. Memiliki akun di [npmjs.com](https://www.npmjs.com/) yang merupakan maintainer/collaborator dari package `n8n-nodes-repliz` (contoh: akun `zickss`).
2. Node.js (v18+) dan `npm` sudah terpasang di sistem lokal.
3. Aplikasi authenticator (2FA) siap digunakan untuk verifikasi login/publish.

---

## 2. Checklist Sebelum Rilis

1. **Pastikan branch utama bersih:**
   ```bash
   git checkout main
   git pull origin main
   git status
   ```

2. **Periksa dan naikkan versi package:**
   Ubah nomor versi di file `package.json` (atau gunakan perintah `npm version patch`, `npm version minor`, atau `npm version major`):
   ```json
   "version": "1.0.15"
   ```

3. **Perbarui CHANGELOG.md:**
   Catat semua perubahan, penambahan fitur, atau perbaikan bug pada versi baru di [CHANGELOG.md](CHANGELOG.md).

4. **Kompilasi / Build Project:**
   Pastikan tidak ada error kompilasi TypeScript dan folder `dist/` terisi dengan berkas hasil build terbaru:
   ```bash
   npm run build
   ```

5. *(Opsional)* **Simulasi Paket (Dry Run):**
   Cek daftar file dan ukuran berkas yang akan diunggah ke registry tanpa benar-benar mempublikasikannya:
   ```bash
   npm pack --dry-run
   ```

---

## 3. Login ke Akun NPM

Jika Anda belum login ke akun NPM di terminal lokal:

```bash
npm login
```

Ikuti petunjuk di terminal:
1. Masukkan **Username** akun npm Anda.
2. Masukkan **Password** akun npm Anda.
3. Masukkan **Email** yang terdaftar.
4. Masukkan kode **One-Time Password (OTP)** dari aplikasi authenticator (2FA) Anda.

Untuk memastikan Anda sudah login dengan akun yang benar:
```bash
npm whoami
```
*Output harus menampilkan username maintainer (misal: `zickss`).*

---

## 4. Publikasikan Package ke NPM

Jalankan perintah publish dengan access flag public:

```bash
npm publish --access public
```

> [!NOTE]
> Jika akun Anda mengaktifkan 2FA untuk publish, terminal akan meminta Anda memasukkan **kode OTP** dari aplikasi authenticator (6 digit). Masukkan kode tersebut segera sebelum kodenya kedaluwarsa.

Setelah berhasil, Anda akan melihat pesan:
```text
+ n8n-nodes-repliz@<version>
```

Untuk memverifikasi versi terbaru sudah aktif di registry publik:
```bash
npm view n8n-nodes-repliz version
```

---

## 5. Simpan dan Push ke Git (Tagging)

Setelah paket berhasil terbit di NPM, tandai commit rilis di Git:

```bash
git add .
git commit -m "chore(release): 1.0.15"
git tag v1.0.15
git push origin main --tags
```

---

## 6. Penyelesaian Masalah (Troubleshooting)

### Error `403 Forbidden` / `404 Not Found` saat publish
- Pastikan Anda sudah login sebagai pemilik atau maintainer package dengan menjalankan `npm whoami`.
- Jika session login sudah kedaluwarsa, jalankan `npm logout` lalu lakukan `npm login` kembali.

### Error `You cannot publish over the previously published versions`
- NPM tidak memperbolehkan publish ulang versi yang sudah pernah dipublish.
- Naikkan nomor patch versi di `package.json` (misal dari `1.0.14` ke `1.0.15`) lalu coba kembali.

### Error `Two-factor authentication code expired`
- Masukkan kode OTP baru dari aplikasi authenticator Anda yang masih aktif.
