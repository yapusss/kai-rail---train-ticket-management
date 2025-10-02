
import React, { useState } from 'react';
import { Ticket, TrainClass, NavigationTab } from '../types';
import { 
    ShoppingCartIcon, MessageIcon, FlagIcon, BellIcon, QRIcon, MoneyIcon, ClockIcon,
    TrainIcon, BuildingIcon, PackageIcon, MoreIcon, TrophyIcon, CoinIcon, SparklesIcon,
    ArrowRightIcon, ArrowLeftIcon
} from '../components/icons/FeatureIcons';
import { TRAIN_SERVICES } from './TrainServicesScreen';


// Mock data for the new dashboard
const MOCK_RAILPOIN = 1250;
const MOCK_NOTIFICATION_COUNT = 52;

// Mock data untuk berbagai layanan
const MOCK_SERVICES = {
    hotels: [
        { name: "Hotel Santika Bandung", location: "Bandung", price: 450000, rating: 4.5, amenities: ["WiFi", "Parking", "Restaurant"] },
        { name: "Ibis Styles Bandung", location: "Bandung", price: 380000, rating: 4.2, amenities: ["WiFi", "Pool", "Breakfast"] },
        { name: "Hotel Grand Mercure Jakarta", location: "Jakarta", price: 650000, rating: 4.7, amenities: ["WiFi", "Spa", "Restaurant", "Parking"] },
        { name: "Favehotel Yogyakarta", location: "Yogyakarta", price: 320000, rating: 4.0, amenities: ["WiFi", "Restaurant"] },
        { name: "Hotel Tunjungan Surabaya", location: "Surabaya", price: 520000, rating: 4.3, amenities: ["WiFi", "Pool", "Parking"] },
        { name: "Aston Hotel Jakarta", location: "Jakarta", price: 580000, rating: 4.4, amenities: ["WiFi", "Pool", "Restaurant", "Spa"] },
        { name: "Harris Hotel Bandung", location: "Bandung", price: 420000, rating: 4.1, amenities: ["WiFi", "Restaurant", "Parking"] },
        { name: "Hotel Mulia Senayan", location: "Jakarta", price: 850000, rating: 4.8, amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Parking"] },
    ],
    carRentals: [
        { name: "Avis Car Rental", location: "Jakarta", price: 250000, type: "Sedan", rating: 4.4 },
        { name: "Hertz Indonesia", location: "Bandung", price: 280000, type: "SUV", rating: 4.6 },
        { name: "Budget Car Rental", location: "Yogyakarta", price: 200000, type: "Hatchback", rating: 4.1 },
        { name: "Enterprise Rent-A-Car", location: "Surabaya", price: 320000, type: "SUV", rating: 4.5 },
        { name: "Sixt Car Rental", location: "Jakarta", price: 290000, type: "Sedan", rating: 4.3 },
    ],
    logistics: [
        { name: "KAI Logistics Express", route: "Jakarta - Surabaya", price: 150000, duration: "1 day", type: "Express" },
        { name: "KAI Logistics Standard", route: "Jakarta - Bandung", price: 75000, duration: "2 days", type: "Standard" },
        { name: "KAI Logistics Heavy", route: "Jakarta - Yogyakarta", price: 180000, duration: "1 day", type: "Heavy Cargo" },
    ],
    insurance: [
        { name: "Travel Insurance Premium", coverage: "Medical + Trip Cancellation", price: 150000, duration: "30 days" },
        { name: "Basic Travel Insurance", coverage: "Medical Only", price: 75000, duration: "30 days" },
        { name: "Family Travel Insurance", coverage: "Family Package", price: 300000, duration: "30 days" },
    ]
};

// Service Button Component
const ServiceButton: React.FC<{ 
    Icon: React.ElementType; 
    label: string; 
    onClick: () => void;
    bgColor: string;
    iconColor?: string;
}> = ({ Icon, label, onClick, bgColor, iconColor = "white" }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center space-y-2 text-center group transition-all hover:scale-105"
    >
        <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
            <Icon className={`w-8 h-8 text-${iconColor}`} />
        </div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{label}</span>
    </button>
);

// Header Icon Component
const HeaderIcon: React.FC<{
    Icon: React.ElementType;
    onClick: () => void;
    badge?: number;
}> = ({ Icon, onClick, badge }) => (
    <button 
        onClick={onClick}
        className="relative p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
    >
        <Icon className="w-5 h-5 text-white" />
        {badge && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {badge}
            </div>
        )}
    </button>
);

// KAI PAY Action Component
const KAIPayAction: React.FC<{
    Icon: React.ElementType;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}> = ({ Icon, label, onClick, disabled = false }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center space-y-1 ${disabled ? 'opacity-50' : 'hover:scale-105'} transition-all`}
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            disabled ? 'bg-gray-200' : 'bg-blue-500'
        }`}>
            <Icon className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-white'}`} />
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </button>
);

interface DashboardScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveTab }) => {
    // State untuk tracking status layanan
    const [serviceStates, setServiceStates] = useState({
        kaipayActivated: false,
        notifications: false
    });

    // State untuk tracking service yang dipilih
    const [selectedService, setSelectedService] = useState<string | null>(null);
    
    // State untuk search functionality
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Fungsi untuk header icons
    const handleMessages = () => {
        alert('💬 Messages\n\nAnda memiliki 3 pesan baru.\nBuka untuk melihat pesan dari KAI Access.');
    };

    const handleLanguageChange = () => {
        alert('🌐 Language Settings\n\nPilih bahasa:\n• Bahasa Indonesia\n• English\n• 中文');
    };

    const handleNotifications = () => {
        setServiceStates(prev => ({
            ...prev,
            notifications: !prev.notifications
        }));
        
        alert(`🔔 Notifications ${serviceStates.notifications ? 'Disabled' : 'Enabled'}\n\nAnda ${serviceStates.notifications ? 'tidak akan' : 'akan'} menerima notifikasi dari KAI Access.`);
    };

    // Fungsi untuk service buttons - langsung menampilkan detail service
    const handleInterCity = () => {
        setSelectedService('intercity');
    };

    const handleLocal = () => {
        setSelectedService('local');
    };

    const handleCommuterLine = () => {
        setSelectedService('commuter');
    };

    const handleLRT = () => {
        setSelectedService('lrt');
    };

    const handleAirport = () => {
        setSelectedService('airport');
    };

    const handleHotel = () => {
        alert('🏨 Hotel Booking\n\nPesan hotel untuk perjalanan Anda.\nTersedia hotel dengan harga khusus untuk penumpang KAI.');
    };

    const handleMultiTripCard = () => {
        alert('💳 Multi Trip Card\n\nKelola kartu multi trip Anda.\nTop up, cek saldo, dan riwayat transaksi.');
    };

    const handleKaiLogistics = () => {
        alert('📦 KAI Logistics\n\nKirim paket dengan KAI Logistics.\nMurah, cepat, dan aman sampai tujuan.');
    };

    const handleShowMore = () => {
        alert('➕ Show More Services\n\nLayanan lainnya:\n• Travel Insurance\n• Car Rental\n• Tour Package\n• Restaurant Reservation');
    };

    // Fungsi untuk promotional banners
    const handleExclusiveBenefits = () => {
        alert('🎁 Exclusive Benefits\n\nBergabunglah dengan program loyalty KAI Access dan nikmati:\n\n• Cashback hingga 10%\n• Poin reward\n• Diskon eksklusif\n• Prioritas booking');
    };

    const handleTripPlanner = () => {
        alert('🗺️ AI TRIP Planner\n\nBuat rencana perjalanan terbaik dengan AI Trip Planner.\nDapatkan saran destinasi, transportasi, dan akomodasi yang disesuaikan dengan preferensi Anda.');
        setActiveTab(NavigationTab.Planner);
    };

    // Fungsi untuk kembali ke dashboard
    const handleBackToDashboard = () => {
        setSelectedService(null);
    };

    // Fungsi untuk booking tiket
    const handleBookTicket = (serviceName: string, route: string) => {
        alert(`🎫 Booking Tiket ${serviceName}\n\nRute: ${route}\n\nFitur booking akan segera tersedia. Silakan hubungi customer service untuk pemesanan.`);
    };

    // Fungsi untuk natural language processing dan search
    const parseSearchQuery = (query: string) => {
        const lowerQuery = query.toLowerCase();
        
        // Extract keywords
        const serviceTypes = {
            hotel: ['hotel', 'penginapan', 'akomodasi'],
            train: ['kereta', 'train', 'tiket kereta', 'naik kereta'],
            car: ['mobil', 'car', 'rental mobil', 'sewa mobil'],
            logistics: ['kirim', 'logistik', 'kargo', 'paket'],
            insurance: ['asuransi', 'insurance', 'perlindungan']
        };

        // Extract location
        const locations = ['jakarta', 'bandung', 'yogyakarta', 'surabaya', 'malang', 'semarang', 'medan', 'palembang'];
        const foundLocation = locations.find(loc => lowerQuery.includes(loc));

        // Extract price range
        const priceMatch = lowerQuery.match(/(\d+(?:\.\d+)?)\s*(?:ribu|rb|000|rupiah|rp)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) * 1000 : null;

        // Extract date
        const dateMatch = lowerQuery.match(/(\d{1,2})\s*(?:oktober|november|desember|januari|februari|maret|april|mei|juni|juli|agustus|september)/);
        const date = dateMatch ? dateMatch[1] : null;

        // Determine service type
        let serviceType = 'all';
        for (const [type, keywords] of Object.entries(serviceTypes)) {
            if (keywords.some(keyword => lowerQuery.includes(keyword))) {
                serviceType = type;
                break;
            }
        }

        return { serviceType, location: foundLocation, price, date, originalQuery: query };
    };

    // Fungsi untuk search
    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        
        // Simulate API delay
        setTimeout(() => {
            const parsed = parseSearchQuery(query);
            let results: any[] = [];

            // Search based on parsed query
            switch (parsed.serviceType) {
                case 'hotel':
                    results = MOCK_SERVICES.hotels.filter(hotel => {
                        let match = true;
                        if (parsed.location && !hotel.location.toLowerCase().includes(parsed.location)) {
                            match = false;
                        }
                        if (parsed.price && hotel.price > parsed.price * 1.2) { // Allow 20% tolerance
                            match = false;
                        }
                        return match;
                    }).map(hotel => ({ ...hotel, type: 'hotel' }));
                    break;

                case 'train':
                    // Get all train variations from TRAIN_SERVICES
                    results = TRAIN_SERVICES.flatMap(service => 
                        service.variations.map(variation => ({
                            ...variation,
                            serviceName: service.name,
                            serviceId: service.id,
                            type: 'train'
                        }))
                    ).filter(train => {
                        if (parsed.location) {
                            return train.route.toLowerCase().includes(parsed.location);
                        }
                        return true;
                    });
                    break;

                case 'car':
                    results = MOCK_SERVICES.carRentals.filter(car => {
                        let match = true;
                        if (parsed.location && !car.location.toLowerCase().includes(parsed.location)) {
                            match = false;
                        }
                        if (parsed.price && car.price > parsed.price * 1.2) {
                            match = false;
                        }
                        return match;
                    }).map(car => ({ ...car, type: 'car' }));
                    break;

                case 'logistics':
                    results = MOCK_SERVICES.logistics.map(logistic => ({ ...logistic, type: 'logistics' }));
                    break;

                case 'insurance':
                    results = MOCK_SERVICES.insurance.map(insurance => ({ ...insurance, type: 'insurance' }));
                    break;

                default:
                    // Search all services
                    results = [
                        ...MOCK_SERVICES.hotels.map(hotel => ({ ...hotel, type: 'hotel' })),
                        ...MOCK_SERVICES.carRentals.map(car => ({ ...car, type: 'car' })),
                        ...MOCK_SERVICES.logistics.map(logistic => ({ ...logistic, type: 'logistics' })),
                        ...MOCK_SERVICES.insurance.map(insurance => ({ ...insurance, type: 'insurance' })),
                        ...TRAIN_SERVICES.flatMap(service => 
                            service.variations.map(variation => ({
                                ...variation,
                                serviceName: service.name,
                                serviceId: service.id,
                                type: 'train'
                            }))
                        )
                    ];
            }

            setSearchResults(results);
            setShowSearchResults(true);
            setIsSearching(false);
        }, 1000);
    };

    // Fungsi untuk handle search input
    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        if (value.trim()) {
            handleSearch(value);
        } else {
            setShowSearchResults(false);
            setSearchResults([]);
        }
    };

    // Fungsi untuk clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    // Komponen untuk menampilkan hasil pencarian
    const SearchResults = () => {
        if (!showSearchResults || searchResults.length === 0) return null;

        const renderResult = (result: any, index: number) => {
            switch (result.type) {
                case 'hotel':
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{result.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.location}</p>
                                    <div className="flex items-center mt-1">
                                        <span className="text-yellow-500">⭐</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{result.rating}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">Rp {result.price.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">per malam</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {result.amenities.map((amenity: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                            <button 
                                onClick={() => alert(`🏨 Booking Hotel ${result.name}\n\nLokasi: ${result.location}\nHarga: Rp ${result.price.toLocaleString()}/malam\n\nFitur booking akan segera tersedia.`)}
                                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Pesan Hotel
                            </button>
                        </div>
                    );

                case 'train':
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{result.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.route}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">{result.serviceName}</p>
                                </div>
                                <div className={`p-3 bg-blue-500 rounded-full`}>
                                    <TrainIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Durasi</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{result.duration}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Harga</p>
                                    <p className="font-semibold text-green-600 dark:text-green-400">{result.price}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleBookTicket(result.name, result.route)}
                                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Pesan Tiket
                            </button>
                        </div>
                    );

                case 'car':
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{result.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.location}</p>
                                    <div className="flex items-center mt-1">
                                        <span className="text-yellow-500">⭐</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{result.rating}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">Rp {result.price.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">per hari</p>
                                </div>
                            </div>
                            <div className="mb-3">
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                                    {result.type}
                                </span>
                            </div>
                            <button 
                                onClick={() => alert(`🚗 Rental Mobil ${result.name}\n\nTipe: ${result.type}\nLokasi: ${result.location}\nHarga: Rp ${result.price.toLocaleString()}/hari\n\nFitur booking akan segera tersedia.`)}
                                className="w-full py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Sewa Mobil
                            </button>
                        </div>
                    );

                case 'logistics':
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{result.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.route}</p>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                        {result.type}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">Rp {result.price.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">{result.duration}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => alert(`📦 KAI Logistics ${result.name}\n\nRute: ${result.route}\nTipe: ${result.type}\nHarga: Rp ${result.price.toLocaleString()}\nDurasi: ${result.duration}\n\nFitur booking akan segera tersedia.`)}
                                className="w-full py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                Kirim Paket
                            </button>
                        </div>
                    );

                case 'insurance':
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{result.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.coverage}</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">{result.duration}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">Rp {result.price.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">per periode</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => alert(`🛡️ Asuransi ${result.name}\n\nCoverage: ${result.coverage}\nDurasi: ${result.duration}\nHarga: Rp ${result.price.toLocaleString()}\n\nFitur booking akan segera tersedia.`)}
                                className="w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Beli Asuransi
                            </button>
                        </div>
                    );

                default:
                    return null;
            }
        };

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                {/* Sticky Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Hasil Pencarian ({searchResults.length})
                        </h3>
                        <button 
                            onClick={clearSearch}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="max-h-96 overflow-y-auto px-4 pb-4">
                    <div className="space-y-3 pt-4">
                        {searchResults.map((result, index) => renderResult(result, index))}
                    </div>
                </div>
            </div>
        );
    };

    // Jika ada service yang dipilih, tampilkan detail service
    if (selectedService) {
        const service = TRAIN_SERVICES.find(s => s.id === selectedService);
        if (!service) return null;

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={handleBackToDashboard}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">{service.name}</h1>
                        <div></div>
                    </div>
                    <p className="text-sm opacity-90 mt-2">{service.description}</p>
                </div>

                {/* Service Variations */}
                <div className="p-4 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pilih Rute</h2>
                    <div className="space-y-3">
                        {service.variations.map((variation, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{variation.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{variation.route}</p>
                                    </div>
                                    <div className={`p-3 ${service.bgColor} rounded-full`}>
                                        <TrainIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Durasi</p>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{variation.duration}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Harga</p>
                                            <p className="font-semibold text-green-600 dark:text-green-400">{variation.price}</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleBookTicket(variation.name, variation.route)}
                                    className={`w-full py-3 ${service.bgColor} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}
                                >
                                    Pesan Tiket
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header Section with 3D Illustration Background */}
            <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 text-white p-6 rounded-b-3xl">
                {/* 3D Illustration Background */}
                <div className="absolute inset-0 overflow-hidden rounded-b-3xl">
                    <div className="absolute top-4 left-4 w-16 h-16 bg-green-400 rounded-full opacity-60"></div>
                    <div className="absolute top-8 right-20 w-12 h-12 bg-blue-400 rounded-full opacity-50"></div>
                    <div className="absolute bottom-8 left-20 w-20 h-20 bg-purple-400 rounded-full opacity-40"></div>
                    <div className="absolute bottom-4 right-8 w-14 h-14 bg-yellow-400 rounded-full opacity-50"></div>
                </div>

                {/* Greeting */}
                <div className="relative flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Good Afternoon</h1>
                    <div className="flex items-center space-x-2">
                        <HeaderIcon Icon={MessageIcon} onClick={handleMessages} />
                        <HeaderIcon Icon={FlagIcon} onClick={handleLanguageChange} />
                        <HeaderIcon Icon={BellIcon} onClick={handleNotifications} badge={MOCK_NOTIFICATION_COUNT} />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder="Cari hotel, tiket kereta, rental mobil... (contoh: hotel 500000 bandung)"
                            className="w-full px-4 py-3 pr-12 pl-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            {isSearching ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                        </div>
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Example Queries */}
                {!searchQuery && (
                    <div className="mt-4">
                        <p className="text-sm text-white/80 mb-2">Contoh pencarian:</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "hotel 500000 bandung",
                                "tiket kereta jakarta surabaya", 
                                "rental mobil jakarta",
                                "asuransi perjalanan",
                                "kirim paket jakarta bandung"
                            ].map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearchInput(example)}
                                    className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-xs text-white/90 hover:bg-white/30 transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="p-4 space-y-6">
                {/* Search Results */}
                <SearchResults />
                
                {/* Service Grid - Horizontal Scrollable */}
                <div className="space-y-4">
                    {/* Train Services - Horizontal Scroll */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Train Services</h3>
                        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="flex space-x-4 min-w-max">
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Inter City" 
                                    onClick={handleInterCity}
                                    bgColor="bg-blue-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Local" 
                                    onClick={handleLocal}
                                    bgColor="bg-orange-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Commuter Line" 
                                    onClick={handleCommuterLine}
                                    bgColor="bg-red-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="LRT" 
                                    onClick={handleLRT}
                                    bgColor="bg-purple-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Airport" 
                                    onClick={handleAirport}
                                    bgColor="bg-blue-400"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Express" 
                                    onClick={handleShowMore}
                                    bgColor="bg-green-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="More" 
                                    onClick={handleShowMore}
                                    bgColor="bg-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Other Services - Horizontal Scroll */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Other Services</h3>
                        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="flex space-x-4 min-w-max">
                                <ServiceButton 
                                    Icon={BuildingIcon} 
                                    label="Hotel" 
                                    onClick={handleHotel}
                                    bgColor="bg-blue-500"
                                />
                                <ServiceButton 
                                    Icon={MoneyIcon} 
                                    label="Multi Trip Card" 
                                    onClick={handleMultiTripCard}
                                    bgColor="bg-blue-500"
                                />
                                <ServiceButton 
                                    Icon={PackageIcon} 
                                    label="KAI Logistics" 
                                    onClick={handleKaiLogistics}
                                    bgColor="bg-blue-500"
                                />
                                <ServiceButton 
                                    Icon={SparklesIcon} 
                                    label="Travel Insurance" 
                                    onClick={handleShowMore}
                                    bgColor="bg-purple-500"
                                />
                                <ServiceButton 
                                    Icon={MoneyIcon} 
                                    label="Car Rental" 
                                    onClick={handleShowMore}
                                    bgColor="bg-green-500"
                                />
                                <ServiceButton 
                                    Icon={MoreIcon} 
                                    label="Show more" 
                                    onClick={handleShowMore}
                                    bgColor="bg-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exclusive Benefits Banner */}
                <div 
                    onClick={handleExclusiveBenefits}
                    className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
                >
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Access to Our Exclusive Benefits</h3>
                        <p className="text-sm opacity-90 mb-4">
                            Nikmati berbagai keuntungan dengan bergabung dalam program loyalty di Access by KAI.
                        </p>
                        <div className="absolute top-4 right-4 bg-white/20 px-2 py-1 rounded text-xs">
                            Ads
                        </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute bottom-2 right-4 flex space-x-2">
                        <TrophyIcon className="w-8 h-8 text-yellow-300 opacity-60" />
                        <CoinIcon className="w-8 h-8 text-yellow-300 opacity-60" />
                    </div>
                </div>

                {/* TRIP Planner Banner */}
                <div 
                    onClick={handleTripPlanner}
                    className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold">P</span>
            </div>
            <div>
                                <h3 className="text-xl font-bold">TRIP Planner</h3>
                                <p className="text-sm opacity-90">Make the best plans for your trip.</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-colors">
                            CREATE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;
