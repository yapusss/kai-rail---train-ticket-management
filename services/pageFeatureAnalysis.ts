

export interface PageFeatureAnalysis {
  pageName: string;
  availableActions: string[];
  voiceCommands: string[];
  accessibilityFeatures: string[];
  userInteractions: string[];
}

export const PAGE_FEATURES: PageFeatureAnalysis[] = [
  {
    pageName: "Dashboard",
    availableActions: [
      "Pencarian layanan (hotel, tiket kereta, rental mobil)",
      "Voice search untuk pencarian",
      "Navigasi ke layanan Antar Kota",
      "Navigasi ke layanan Commuter Line", 
      "Navigasi ke Tiket Saya",
      "Navigasi ke AI Trip Planner",
      "Navigasi ke Akun",
      "Melihat RailPoint dan notifikasi"
    ],
    voiceCommands: [
      "Cari hotel jakarta",
      "Cari tiket kereta",
      "Cari rental mobil",
      "Buka antar kota",
      "Buka commuter",
      "Lihat tiket saya",
      "Buka planner",
      "Buka akun"
    ],
    accessibilityFeatures: [
      "Page announcement saat membuka halaman",
      "Element announcement untuk kotak pencarian",
      "Action announcement untuk voice search",
      "Success/error announcement untuk hasil pencarian",
      "Voice command conflict management"
    ],
    userInteractions: [
      "Klik tombol mikrofon untuk voice search",
      "Ketik di kotak pencarian",
      "Klik tombol layanan (Antar Kota, Commuter, dll)",
      "Klik logo untuk kembali ke dashboard",
      "Klik tombol tema untuk ganti dark/light mode"
    ]
  },
  {
    pageName: "TicketsScreen",
    availableActions: [
      "Pencarian tiket berdasarkan bulan",
      "Pencarian tiket berdasarkan tahun", 
      "Pencarian tiket berdasarkan nama kereta",
      "Pencarian tiket berdasarkan rute",
      "Voice search untuk pencarian tiket",
      "Melihat detail tiket",
      "Mengunduh tiket PDF",
      "Rebooking tiket",
      "Mengganti tab aktif/riwayat"
    ],
    voiceCommands: [
      "Tiket bulan desember",
      "Tiket tahun 2024", 
      "Kereta argo bromo",
      "Jakarta ke yogyakarta",
      "TIX-1234 (kode booking)",
      "Tampilkan tiket aktif",
      "Tampilkan riwayat tiket"
    ],
    accessibilityFeatures: [
      "Page announcement saat membuka halaman",
      "Element announcement untuk kotak pencarian",
      "Action announcement untuk voice search",
      "Success announcement untuk hasil pencarian",
      "Voice command conflict management",
      "Tab switching announcement"
    ],
    userInteractions: [
      "Klik tombol mikrofon untuk voice search",
      "Ketik di kotak pencarian",
      "Klik tab Aktif/Riwayat",
      "Klik tiket untuk melihat detail",
      "Klik tombol download",
      "Klik tombol rebook",
      "Klik tombol close untuk tutup detail"
    ]
  },
  {
    pageName: "PlannerScreen", 
    availableActions: [
      "Input deskripsi perjalanan",
      "Voice input untuk deskripsi perjalanan",
      "Generate trip plan dengan AI",
      "Melihat hasil rencana perjalanan",
      "Klik kereta untuk detail",
      "Melihat contoh voice commands"
    ],
    voiceCommands: [
      "Saya ingin pergi dari Jakarta ke Yogyakarta akhir pekan depan",
      "Buatkan rencana perjalanan ke Bandung dengan kereta eksekutif",
      "Saya berangkat hari Jumat dan kembali hari Minggu",
      "Perjalanan ke Surabaya dengan budget lima ratus ribu"
    ],
    accessibilityFeatures: [
      "Page announcement saat membuka halaman",
      "Element announcement untuk textarea",
      "Action announcement untuk voice input",
      "Success announcement untuk hasil AI",
      "Voice command conflict management",
      "Loading state announcement"
    ],
    userInteractions: [
      "Ketik di textarea deskripsi perjalanan",
      "Klik tombol mikrofon untuk voice input",
      "Klik tombol Generate Plan",
      "Klik kereta dalam hasil untuk detail",
      "Klik tombol close untuk tutup contoh"
    ]
  }
];


export const getPageFeatures = (pageName: string): PageFeatureAnalysis | null => {
  return PAGE_FEATURES.find(page => page.pageName === pageName) || null;
};


export const getAllVoiceCommands = (): string[] => {
  return PAGE_FEATURES.flatMap(page => page.voiceCommands);
};


export const getAllAccessibilityFeatures = (): string[] => {
  return PAGE_FEATURES.flatMap(page => page.accessibilityFeatures);
};
