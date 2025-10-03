import React, { useState, useEffect } from 'react';
import { Ticket, TrainClass, NavigationTab } from '../types';
import { 
    TrainIcon, BuildingIcon, PackageIcon, MoreIcon, TrophyIcon, SparklesIcon
} from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';
import Swal from 'sweetalert2';
import { useAccessibility } from '../hooks/useAccessibility';
import { voiceConflictManager } from '../services/voiceConflictManager';

declare global {
    interface Window {
        searchTimeout?: NodeJS.Timeout;
    }
}

const MOCK_RAILPOIN = 1250;
const MOCK_NOTIFICATION_COUNT = 52;

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    return "Selamat Malam";
};

const ServiceButton: React.FC<{ 
    Icon: React.ElementType; 
    label: string; 
    onClick: () => void;
    bgColor: string;
    iconColor?: string;
}> = ({ Icon, label, onClick, bgColor, iconColor = "white" }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center space-y-2 text-center group transition-all hover:scale-105 p-2"
    >
        <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
            <Icon className={`w-8 h-8 text-${iconColor}`} />
        </div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{label}</span>
    </button>
);

interface DashboardScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveTab }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);

    const { announcePage, announceElement, announceAction, announceError, announceSuccess, settings } = useAccessibility();

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setBrowserSupportsSpeechRecognition(true);
        }

        if (settings.enabled) {
            announcePage({
                pageTitle: "Dashboard",
                pageDescription: "Halaman utama aplikasi KAI Access. Di sini Anda dapat melihat ringkasan perjalanan, mencari layanan, dan mengakses fitur-fitur utama.",
                availableActions: [
                    "mencari hotel, tiket kereta, atau rental mobil menggunakan kotak pencarian",
                    "menggunakan perintah suara untuk pencarian",
                    "mengakses layanan Antar Kota untuk kereta jarak jauh",
                    "mengakses layanan Commuter Line untuk kereta lokal",
                    "melihat tiket yang sudah dibeli",
                    "mengakses AI Trip Planner untuk merencanakan perjalanan",
                    "mengelola akun dan pengaturan"
                ],
                voiceInstructions: "Anda bisa menggunakan kotak pencarian untuk mencari layanan yang diinginkan, atau klik tombol mikrofon untuk pencarian dengan suara. Gunakan tombol layanan untuk mengakses fitur-fitur utama."
            });
        }
        
        console.log('Testing search functionality...');
        TrainDataService.testSearch();
    }, [settings.enabled, announcePage]);

    const startListening = () => {
        if (!browserSupportsSpeechRecognition) {
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan!',
                text: 'Browser Anda tidak mendukung voice recognition',
                confirmButtonText: 'Baik'
            });
            return;
        }

        voiceConflictManager.startVoiceCommand();

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'id-ID';

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
            announceAction("Mendengarkan perintah pencarian", "Silakan sebutkan apa yang ingin Anda cari");
        };

        recognition.onresult = (event) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
            setSearchQuery(currentTranscript);
            handleSearchInput(currentTranscript);
            announceSuccess(`Pencarian dengan suara: ${currentTranscript}`);
        };

        recognition.onerror = (event) => {
            Swal.fire({
              icon: 'error',
              title: 'Kesalahan Suara',
              text: 'Terjadi kesalahan saat mengenali suara.',
              confirmButtonText: 'Baik'
            });
            announceError("Terjadi kesalahan saat mengenali suara", "Silakan coba lagi atau gunakan keyboard");
            setIsListening(false);
            voiceConflictManager.endVoiceCommand();
        };

        recognition.onend = () => {
            setIsListening(false);
            announceAction("Pengenalan suara selesai");
            voiceConflictManager.endVoiceCommand();
        };

        recognition.start();
    };

    const stopListening = () => {
        setIsListening(false);
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        
        setTimeout(() => {
            try {
                console.log('Searching for:', query);
                
                const searchResults = TrainDataService.searchAllServices(query);
                console.log('Search results from service:', searchResults);
                console.log('Service results breakdown:', {
                    trains: searchResults.trains?.length || 0,
                    hotels: searchResults.hotels?.length || 0,
                    carRentals: searchResults.carRentals?.length || 0,
                    logistics: searchResults.logistics?.length || 0,
                    insurance: searchResults.insurance?.length || 0
                });
                
                const allResults: any[] = [];
                
                if (searchResults.hotels && searchResults.hotels.length > 0) {
                    console.log('Processing hotels:', searchResults.hotels.length);
                    searchResults.hotels.forEach(hotel => {
                        allResults.push({
                            ...hotel,
                            type: 'hotel',
                            displayName: hotel.name,
                            displayLocation: hotel.location,
                            displayPrice: TrainDataService.formatPrice(hotel.price)
                        });
                    });
                    console.log('Hotels added to allResults, current length:', allResults.length);
                } else {
                    console.log('No hotels found or hotels array is empty');
                }
                
                if (searchResults.trains && searchResults.trains.length > 0) {
                    console.log('Processing trains:', searchResults.trains.length);
                    searchResults.trains.forEach(train => {
                        allResults.push({
                            ...train,
                            type: 'train',
                            displayName: train.name,
                            displayLocation: `${train.route.from.city} - ${train.route.to.city}`,
                            displayPrice: TrainDataService.formatPrice(train.classes[0]?.price || 0)
                        });
                    });
                    console.log('Trains added to allResults, current length:', allResults.length);
                } else {
                    console.log('No trains found or trains array is empty');
                }
                
                if (searchResults.carRentals && searchResults.carRentals.length > 0) {
                    searchResults.carRentals.forEach(car => {
                        allResults.push({
                            ...car,
                            type: 'car',
                            displayName: car.name,
                            displayLocation: car.location,
                            displayPrice: TrainDataService.formatPrice(car.price)
                        });
                    });
                }
                
                if (searchResults.logistics && searchResults.logistics.length > 0) {
                    searchResults.logistics.forEach(logistic => {
                        allResults.push({
                            ...logistic,
                            type: 'logistics',
                            displayName: logistic.name,
                            displayLocation: logistic.route,
                            displayPrice: TrainDataService.formatPrice(logistic.price)
                        });
                    });
                }
                
                if (searchResults.insurance && searchResults.insurance.length > 0) {
                    searchResults.insurance.forEach(insurance => {
                        allResults.push({
                            ...insurance,
                            type: 'insurance',
                            displayName: insurance.name,
                            displayLocation: insurance.coverage,
                            displayPrice: TrainDataService.formatPrice(insurance.price)
                        });
                    });
                }

                console.log('Final combined results:', allResults);
                console.log('Setting search results and showing results...');
                
                setSearchResults(allResults);
                setShowSearchResults(allResults.length > 0);
                setIsSearching(false);
                
                console.log('Search completed - results should be visible now');
                
                setTimeout(() => {
                    console.log('After state update - showSearchResults should be true, results length:', allResults.length);
                }, 100);
            } catch (error) {
                Swal.fire({
                  icon: 'error',
                  title: 'Kesalahan Pencarian',
                  text: 'Terjadi kesalahan saat melakukan pencarian.',
                  confirmButtonText: 'Baik'
                });
                setSearchResults([]);
                setShowSearchResults(false);
                setIsSearching(false);
            }
        }, 1000);
    };

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        
        if (window.searchTimeout) {
            clearTimeout(window.searchTimeout);
        }
        
        if (value.trim()) {
            window.searchTimeout = setTimeout(() => {
                handleSearch(value);
            }, 500);
        } else {
            setShowSearchResults(false);
            setSearchResults([]);
        }
    };

    useEffect(() => {
        if (transcript && transcript.trim()) {
            console.log('Transcript received:', transcript);
            handleSearch(transcript);
        }
    }, [transcript]);

    useEffect(() => {
        console.log('State changed - showSearchResults:', showSearchResults, 'searchResults.length:', searchResults.length);
        console.log('searchResults content:', searchResults);
    }, [showSearchResults, searchResults]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    const handleNotificationClick = () => {
        setActiveTab(NavigationTab.Notifications);
    };

    const SearchResults = () => {
        console.log('SearchResults component called - showSearchResults:', showSearchResults, 'searchResults.length:', searchResults.length);
        if (!showSearchResults || searchResults.length === 0) return null;

    return (
            <div className="space-y-3">
                {searchResults.map((result, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {result.displayName || result.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {result.displayLocation || result.location}
                                </p>
                                <div className="flex items-center mt-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        result.type === 'hotel' ? 'bg-blue-100 text-blue-800' :
                                        result.type === 'train' ? 'bg-green-100 text-green-800' :
                                        result.type === 'car' ? 'bg-purple-100 text-purple-800' :
                                        result.type === 'logistics' ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {result.type === 'hotel' ? '🏨 Hotel' :
                                         result.type === 'train' ? '🚄 Kereta' :
                                         result.type === 'car' ? '🚗 Rental' :
                                         result.type === 'logistics' ? '📦 Logistik' :
                                         result.type === 'insurance' ? '🛡️ Asuransi' : 'Layanan'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {result.displayPrice || TrainDataService.formatPrice(result.price || 0)}
                                </p>
                            </div>
                        </div>
                        
                        {result.amenities && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {result.amenities.slice(0, 3).map((amenity: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        <button 
                            onClick={() => Swal.fire({
                                icon: 'info',
                                title: '📋 Booking',
                                html: `<div class="text-left">
                                    <p><strong>${result.displayName || result.name}</strong></p>
                                    <p>Lokasi: ${result.displayLocation || result.location}</p>
                                    <p>Harga: ${result.displayPrice || TrainDataService.formatPrice(result.price || 0)}</p>
                                    <p class="mt-3 text-gray-600">Fitur booking akan segera tersedia.</p>
                                </div>`,
                                confirmButtonText: 'Baik'
                            })}
                            className={`w-full py-2 text-white font-semibold rounded-lg transition-colors ${
                                result.type === 'hotel' ? 'bg-blue-500 hover:bg-blue-600' :
                                result.type === 'train' ? 'bg-green-500 hover:bg-green-600' :
                                result.type === 'car' ? 'bg-purple-500 hover:bg-purple-600' :
                                result.type === 'logistics' ? 'bg-orange-500 hover:bg-orange-600' :
                                'bg-gray-500 hover:bg-gray-600'
                            }`}
                        >
                            Pesan Sekarang
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 rounded-b-3xl">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                      
                            <div>
                                <h1 className="text-2xl font-bold text-white">{getGreeting()}</h1>
                                <p className="text-white/80 text-sm">Selamat datang di KAI Access</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={handleNotificationClick}
                                className="relative p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                    {MOCK_NOTIFICATION_COUNT}
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="relative">
                            <input
                                type="text"
                                value={transcript || searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder={isListening ? "Mendengarkan..." : "Cari hotel, tiket kereta, rental mobil... (contoh: hotel jakarta)"}
                                className={`w-full px-4 py-3 pr-20 pl-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 ${isListening ? 'animate-pulse' : ''}`}
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
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-2 rounded-full transition-colors ${
                                        isListening 
                                            ? 'bg-red-500 text-white animate-pulse' 
                                            : 'text-white/70 hover:text-white hover:bg-white/20'
                                    } ${!browserSupportsSpeechRecognition ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={browserSupportsSpeechRecognition 
                                        ? (isListening ? 'Berhenti mendengarkan' : 'Mulai pencarian suara')
                                        : 'Pengenalan suara tidak didukung'
                                    }
                                    disabled={!browserSupportsSpeechRecognition}
                                >
                                    {isListening ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 6h12v12H6z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    )}
                                </button>
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="text-white/70 hover:text-white transition-colors p-1"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {(() => {
                        console.log('Rendering search results section - showSearchResults:', showSearchResults, 'searchResults.length:', searchResults.length);
                        const shouldShow = searchResults.length > 0;
                        console.log('Should show results:', shouldShow);
                        return shouldShow;
                    })() && (
                        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <div className="bg-white/10 backdrop-blur-sm rounded-t-2xl px-4 py-3 border-b border-white/20">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-white">
                                        Hasil Pencarian ({searchResults.length})
                                    </h3>
                                    <button 
                                        onClick={clearSearch}
                                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            
                            <div className="px-4 pb-4 max-h-64 overflow-y-auto">
                                <div className="pt-4">
                                    <SearchResults />
                                </div>
                            </div>
                        </div>
                    )}

                    {searchQuery && !isSearching && searchResults.length === 0 && (
                        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Tidak Ditemukan
                                </h3>
                                <p className="text-white/70 text-sm mb-4">
                                    Maaf, tidak ada hasil yang ditemukan untuk pencarian "<span className="font-medium">{searchQuery}</span>"
                                </p>
                                <div className="text-xs text-white/60 space-y-1">
                                    <p>Coba gunakan kata kunci yang berbeda:</p>
                                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                                        {['hotel jakarta', 'tiket kereta', 'rental mobil', 'asuransi'].map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSearchInput(suggestion)}
                                                className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white/80 hover:bg-white/30 transition-colors text-xs"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={clearSearch}
                                    className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white/80 hover:bg-white/30 transition-colors text-sm"
                                >
                                    Hapus Pencarian
                                </button>
                            </div>
                        </div>
                    )}
                    

                    

                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Layanan Kereta</h3>
                        <div className="flex space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-hide">
                            <div className="flex space-x-2 min-w-max">
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Antar Kota" 
                                    onClick={() => setActiveTab(NavigationTab.InterCityBooking)}
                                    bgColor="bg-blue-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Lokal" 
                                    onClick={() => setActiveTab(NavigationTab.InterCityBooking)}
                                    bgColor="bg-orange-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Commuter Line" 
                                    onClick={() => setActiveTab(NavigationTab.CommuterLine)}
                                    bgColor="bg-red-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="LRT" 
                                    onClick={() => setActiveTab(NavigationTab.CommuterLine)}
                                    bgColor="bg-purple-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Airport" 
                                    onClick={() => setActiveTab(NavigationTab.InterCityBooking)}
                                    bgColor="bg-blue-400"
                                />
                    </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Layanan Lainnya</h3>
                        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                            <div className="flex space-x-2 min-w-max">
                                <ServiceButton 
                                    Icon={BuildingIcon} 
                                    label="Hotel" 
                                    onClick={() => Swal.fire({
                                        icon: 'info',
                                        title: '🏨 Layanan Hotel',
                                        text: 'Segera Hadir',
                                        confirmButtonText: 'Baik'
                                    })}
                                    bgColor="bg-green-500"
                                />
                                <ServiceButton 
                                    Icon={PackageIcon} 
                                    label="Logistik" 
                                    onClick={() => Swal.fire({
                                        icon: 'info',
                                        title: '📦 Layanan Logistik',
                                        text: 'Segera Hadir',
                                        confirmButtonText: 'Baik'
                                    })}
                                    bgColor="bg-yellow-500"
                                />
                                <ServiceButton 
                                    Icon={MoreIcon} 
                                    label="Lainnya" 
                                    onClick={() => Swal.fire({
                                        icon: 'info',
                                        title: '🔧 Layanan Lainnya',
                                        text: 'Segera Hadir',
                                        confirmButtonText: 'Baik'
                                    })}
                                    bgColor="bg-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Perencana Perjalanan AI</h3>
                            <p className="text-white/80 text-sm">Rencanakan perjalanan Anda dengan AI</p>
                        </div>
                        <SparklesIcon className="w-8 h-8 text-white/80" />
                    </div>
                    <button 
                        onClick={() => setActiveTab(NavigationTab.Planner)}
                        className="w-full py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-colors"
                    >
                        BUAT RENCANA
                    </button>
            </div>

                <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between">
            <div>
                            <h3 className="text-xl font-bold mb-2">Penawaran Spesial</h3>
                            <p className="text-white/80 text-sm">Diskon hingga 50% untuk perjalanan liburan</p>
                        </div>
                        <TrophyIcon className="w-8 h-8 text-white/80" />
                    </div>
                    <button className="mt-4 w-full py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-semibold hover:bg-white/30 transition-colors">
                        Lihat Promo
                    </button>
                </div>
            </div>
            <div className="pb-2"></div>
        </div>
    );
};

export default DashboardScreen;