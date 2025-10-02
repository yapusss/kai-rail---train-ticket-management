import React, { useState, useEffect } from 'react';
import { Ticket, TrainClass, NavigationTab } from '../types';
import { 
    TrainIcon, BuildingIcon, PackageIcon, MoreIcon, TrophyIcon, SparklesIcon
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
    setActiveTab: (tab: NavigationTab) => void;
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
                console.log('Service results breakdown:', {
                    trains: searchResults.trains?.length || 0,
                    hotels: searchResults.hotels?.length || 0,
                    carRentals: searchResults.carRentals?.length || 0,
                    logistics: searchResults.logistics?.length || 0,
                    insurance: searchResults.insurance?.length || 0
                });
                
                // Combine all results into a simple array
                const allResults: any[] = [];
                
                // Add hotels
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
                
                // Add trains
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
                console.log('Setting search results and showing results...');
                
                // Use functional updates to ensure state consistency
                setSearchResults(allResults);
                setShowSearchResults(allResults.length > 0);
                setIsSearching(false);
                
                console.log('Search completed - results should be visible now');
                
                // Force re-render debugging
                setTimeout(() => {
                    console.log('After state update - showSearchResults should be true, results length:', allResults.length);
                }, 100);
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

    // Effect untuk handle transcript changes (voice recognition)
    useEffect(() => {
        if (transcript && transcript.trim()) {
            console.log('Transcript received:', transcript);
            handleSearch(transcript);
        }
    }, [transcript]);

    // Debug effect untuk tracking state changes
    useEffect(() => {
        console.log('State changed - showSearchResults:', showSearchResults, 'searchResults.length:', searchResults.length);
        console.log('searchResults content:', searchResults);
    }, [showSearchResults, searchResults]);

    // Fungsi untuk clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    // Komponen untuk menampilkan hasil pencarian yang disederhanakan
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
            <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 rounded-b-3xl">
                <div className="relative z-10">
                    
                    {/* Search Bar */}
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
                                {/* Voice Recognition Button */}
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-2 rounded-full transition-colors ${
                                        isListening 
                                            ? 'bg-red-500 text-white animate-pulse' 
                                            : 'text-white/70 hover:text-white hover:bg-white/20'
                                    } ${!browserSupportsSpeechRecognition ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={browserSupportsSpeechRecognition 
                                        ? (isListening ? 'Stop listening' : 'Start voice search')
                                        : 'Voice recognition not supported'
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

                    {/* Search Results - Inside Header */}
                    {(() => {
                        console.log('Rendering search results section - showSearchResults:', showSearchResults, 'searchResults.length:', searchResults.length);
                        const shouldShow = searchResults.length > 0;
                        console.log('Should show results:', shouldShow);
                        return shouldShow;
                    })() && (
                        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-h-80 overflow-y-auto">
                            {/* Sticky Header */}
                            <div className="sticky top-0 bg-white/60 backdrop-blur-sm rounded-t-2xl px-4 py-3 border-b border-white/20">
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

                    {/* No Results Found - Show when search query exists but no results */}
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
                    
                    {/* Debug Info
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-2 text-xs text-white/50">
                            Debug: showSearchResults={showSearchResults.toString()}, results={searchResults.length}
                        </div>
                    )} */}
                    
                    {/* Fallback Results Display - Always show if we have results */}
                    {/* {searchResults.length > 0 && (
                        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-h-80 overflow-y-auto">
                            <div className="px-4 py-3 border-b border-white/20">
                                <h3 className="text-lg font-semibold text-white">
                                    Hasil Pencarian ({searchResults.length}) - Fallback
                                </h3>
                            </div>
                            <div className="px-4 pb-4">
                                <div className="pt-4">
                                    {searchResults.map((result, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-3">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {result.displayName || result.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {result.displayLocation || result.location}
                                                    </p>
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
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        {result.displayPrice || TrainDataService.formatPrice(result.price || 0)}
                                                    </p>
                                                </div>
                                            </div>
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
                            </div>
                        </div>
                    )} */}
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
                                    Icon={TrainIcon} 
                                    label="Inter City" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices)}
                                    bgColor="bg-blue-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Local" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices)}
                                    bgColor="bg-orange-500"
                                />
                                <ServiceButton 
                                    Icon={TrainIcon} 
                                    label="Commuter Line" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices)}
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
                                    label="Airport" 
                                    onClick={() => setActiveTab(NavigationTab.TrainServices)}
                                    bgColor="bg-blue-400"
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