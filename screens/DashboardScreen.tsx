import React, { useState, useEffect } from 'react';
import { Ticket, TrainClass, NavigationTab } from '../types';
import { 
    TrainIcon, BuildingIcon, PackageIcon, MoreIcon, TrophyIcon, SparklesIcon, InterCityTrainIcon
} from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';

// Extend window interface for search timeout
declare global {
    interface Window {
        searchTimeout?: NodeJS.Timeout;
    }
}

// Mock data for the new dashboard
const MOCK_RAILPOIN = 1250;
const MOCK_NOTIFICATION_COUNT = 52;

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

interface DashboardScreenProps {
    setActiveTab: (tab: NavigationTab, serviceId?: string) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveTab }) => {
    // State untuk search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // State untuk voice recognition
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);

    // Setup voice recognition
    useEffect(() => {
        // Check if browser supports speech recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setBrowserSupportsSpeechRecognition(true);
        }
        
        // Test search functionality on component mount
        console.log('Testing search functionality...');
        TrainDataService.testSearch();
    }, []);

    // Fungsi untuk voice recognition
    const startListening = () => {
        if (!browserSupportsSpeechRecognition) {
            alert('Browser Anda tidak mendukung voice recognition');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'id-ID';

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognition.onresult = (event) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
            setSearchQuery(currentTranscript);
            handleSearchInput(currentTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const stopListening = () => {
        setIsListening(false);
    };

    // Fungsi untuk search yang disederhanakan
    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        
        // Simulate API delay
        setTimeout(() => {
            try {
                console.log('Searching for:', query);
                
                // Get search results from centralized service
                const searchResults = TrainDataService.searchAllServices(query);
                console.log('Search results from service:', searchResults);
                
                // Combine all results into a simple array
                const allResults: any[] = [];
                
                // Add hotels
                if (searchResults.hotels && searchResults.hotels.length > 0) {
                    searchResults.hotels.forEach(hotel => {
                        allResults.push({
                            ...hotel,
                            type: 'hotel',
                            displayName: hotel.name,
                            displayLocation: hotel.location,
                            displayPrice: TrainDataService.formatPrice(hotel.price)
                        });
                    });
                }
                
                // Add trains
                if (searchResults.trains && searchResults.trains.length > 0) {
                    searchResults.trains.forEach(train => {
                        allResults.push({
                            ...train,
                            type: 'train',
                            displayName: train.name,
                            displayLocation: `${train.route.from.city} - ${train.route.to.city}`,
                            displayPrice: TrainDataService.formatPrice(train.classes[0]?.price || 0)
                        });
                    });
                }
                
                // Add car rentals
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
                
                // Add logistics
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
                
                // Add insurance
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
                setSearchResults(allResults);
                setShowSearchResults(true);
                setIsSearching(false);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
                setShowSearchResults(false);
                setIsSearching(false);
            }
        }, 1000);
    };

    // Fungsi untuk handle search input dengan debounce
    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        
        // Clear previous timeout
        if (window.searchTimeout) {
            clearTimeout(window.searchTimeout);
        }
        
        if (value.trim()) {
            // Debounce search - wait 500ms after user stops typing
            window.searchTimeout = setTimeout(() => {
                handleSearch(value);
            }, 500);
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

    // Komponen untuk menampilkan hasil pencarian yang disederhanakan
    const SearchResults = () => {
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
                            onClick={() => alert(`📋 Booking ${result.displayName || result.name}\n\nLokasi: ${result.displayLocation || result.location}\nHarga: ${result.displayPrice || TrainDataService.formatPrice(result.price || 0)}\n\nFitur booking akan segera tersedia.`)}
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header Section with Search */}
            <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 text-white p-6 rounded-b-3xl">
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-2">Access by KAI</h1>
                    <p className="text-white/80 mb-6">Your Travel Companion</p>
                    
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder="Cari hotel, tiket kereta, rental mobil... (contoh: hotel jakarta)"
                                className="w-full px-4 py-3 pr-20 pl-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
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
                                {/* Voice Recognition Button */}
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-2 rounded-full transition-colors ${
                                        isListening 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-500 text-white hover:bg-gray-600'
                                    } ${!browserSupportsSpeechRecognition ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={browserSupportsSpeechRecognition 
                                        ? (isListening ? 'Stop listening' : 'Start voice search')
                                        : 'Voice recognition not supported'
                                    }
                                    disabled={!browserSupportsSpeechRecognition}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
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
                        
                        {/* Voice Recognition Status */}
                        <div className="mt-2 text-xs text-white/70 flex items-center space-x-2">
                            <span>Voice Search:</span>
                            <span className={isListening ? "text-green-400" : "text-red-400"}>
                                {browserSupportsSpeechRecognition 
                                    ? (isListening ? "Mendengarkan..." : "Tidak aktif")
                                    : "Tidak didukung"
                                }
                            </span>
                            {transcript && (
                                <span className="text-white/50">
                                    "{transcript}"
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Search Results - Inside Header */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-h-80 overflow-y-auto">
                            {/* Sticky Header */}
                            <div className="sticky top-0 bg-white/10 backdrop-blur-sm rounded-t-2xl px-4 py-3 border-b border-white/20">
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
                            
                            {/* Scrollable Content */}
                            <div className="px-4 pb-4">
                                <div className="pt-4">
                                    <SearchResults />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 space-y-6">
                {/* Service Grid - Horizontal Scrollable */}
                <div className="space-y-4">
                    {/* Train Services - Horizontal Scroll */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Train Services</h3>
                        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="flex space-x-4 min-w-max">
                                <ServiceButton 
                                    Icon={InterCityTrainIcon} 
                                    label="Antar Kota" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices)}
                                    bgColor="bg-blue-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Lokal" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices)}
                                    bgColor="bg-orange-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Commuter Line" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices, 'commuter')}
                                    bgColor="bg-red-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="LRT" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices)}
                                    bgColor="bg-purple-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Bandara" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices)}
                                    bgColor="bg-blue-400"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Whoosh" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices)}
                                    bgColor="bg-red-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Other Services */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Other Services</h3>
                        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="flex space-x-4 min-w-max">
                                <ServiceButton 
                                    Icon={BuildingIcon} 
                                    label="Hotels" 
                                    onClick={() => alert('🏨 Hotel Services - Coming Soon')}
                                    bgColor="bg-green-500"
                                />
                                <ServiceButton 
                                    Icon={PackageIcon} 
                                    label="Logistics" 
                                    onClick={() => alert('📦 Logistics Services - Coming Soon')}
                                    bgColor="bg-yellow-500"
                                />
                                <ServiceButton 
                                    Icon={MoreIcon} 
                                    label="More" 
                                    onClick={() => alert('🔧 More Services - Coming Soon')}
                                    bgColor="bg-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Commuter Line - Temporary */}
                <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl p-4 text-white mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">🚆 Test Commuter Line</h3>
                            <p className="text-sm opacity-90">Klik untuk langsung ke halaman Commuter Line</p>
                        </div>
                        <button 
                            onClick={() => setActiveTab(NavigationTab.TrainServices, 'commuter')}
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            TEST
                        </button>
                    </div>
                </div>

                {/* Trip Planner Section */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold mb-2">AI Trip Planner</h3>
                            <p className="text-white/80 text-sm">Rencanakan perjalanan Anda dengan AI</p>
                        </div>
                        <SparklesIcon className="w-8 h-8 text-white/80" />
                    </div>
                    <button 
                        onClick={() => setActiveTab(NavigationTab.Planner)}
                        className="w-full py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-colors"
                    >
                        CREATE Plan
                    </button>
            </div>

                {/* Promotional Banner */}
                <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
            <div>
                            <h3 className="text-xl font-bold mb-2">Special Offer</h3>
                            <p className="text-white/80 text-sm">Diskon hingga 50% untuk perjalanan liburan</p>
                        </div>
                        <TrophyIcon className="w-8 h-8 text-white/80" />
                    </div>
                    <button className="mt-4 w-full py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-semibold hover:bg-white/30 transition-colors">
                        Lihat Promo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;