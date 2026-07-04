# Daily Focus Space – Panduan Proyek

## Gambaran Umum
Daily Focus Space adalah To-Do List Life Dashboard yang dibuat sebagai proyek mini untuk kursus rekayasa perangkat lunak CodingCamp. Ini adalah dasbor web yang bersih dan minimalis untuk membantu pengguna mengatur harinya dengan jam digital, sapaan, timer fokus, daftar tugas, dan tautan cepat.

## Teknologi yang Digunakan
- **HTML** – struktur halaman (`index.html`)
- **CSS** – tampilan/styling (`css/style.css`)
- **Vanilla JavaScript** – semua interaktivitas (`js/script.js`)
- Tanpa framework, tanpa backend, tanpa build tools

## Penyimpanan Data
Semua data disimpan di sisi klien menggunakan **Local Storage API browser**:
| Kunci | Data |
|---|---|
| `dfs_userName` | Nama pengguna untuk sapaan |
| `dfs_theme` | Preferensi tema terang atau gelap |
| `dfs_pomodoroMins` | Durasi pomodoro yang dipilih |
| `dfs_tasks` | Daftar tugas (array JSON) |
| `dfs_links` | Tautan cepat (array JSON) |

## Struktur Folder
```
CodingCamp-29June26-Stevino/
├── index.html
├── css/
│   └── style.css      ← hanya 1 file CSS
├── js/
│   └── script.js      ← hanya 1 file JS
├── .kiro/
│   └── steering/
│       └── project.md
└── README.md
```

## Fitur yang Diimplementasi

### Wajib (MVP)
- **Sapaan** – jam digital, tanggal hari ini, dan sapaan berdasarkan waktu (Good Morning / Afternoon / Evening / Night)
- **Timer Fokus** – hitung mundur 25 menit dengan tombol Start, Stop, Reset dan indikator cincin SVG
- **Daftar Tugas** – tambah, edit (inline), tandai selesai, hapus, filter (Semua/Aktif/Selesai), tersimpan di Local Storage
- **Tautan Cepat** – tambah tombol URL bernamakan yang membuka tab baru, tersimpan di Local Storage

### Tantangan yang Diselesaikan (semua 5)
1. ✅ Mode terang / gelap (tersimpan)
2. ✅ Nama kustom pada sapaan (tersimpan)
3. ✅ Ganti durasi Pomodoro (15 / 25 / 45 menit, tersimpan)
4. ✅ Cegah tugas duplikat (tidak membedakan huruf besar/kecil, animasi shake pada duplikat)
5. ✅ Urutkan tugas A–Z / Z–A

## Konvensi Penulisan Kode
- Satu listener `DOMContentLoaded` yang membungkus semua logika JS
- CSS custom properties (variabel) untuk tema
- HTML semantik dengan label ARIA untuk aksesibilitas
- Atribut `data-` untuk status (filter, durasi pomodoro)
- Kunci Local Storage diawali `dfs_` untuk menghindari tabrakan nama
