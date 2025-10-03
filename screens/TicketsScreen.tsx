import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, TrainClass, BookedTicket } from '../types';
import { interpretSearchQuery } from '../services/geminiService';
import { SearchIcon, MicrophoneIcon, FilterIcon, DownloadIcon, RebookIcon, ArrowRightIcon, ArrowLeftIcon } from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';

// Generate mock tickets from centralized train data
const generateMockTickets = (): Ticket[] => {
    const trains = TrainDataService.getInterCityTrains().concat(TrainDataService.getLocalTrains());
    return trains.slice(0, 4).map((train, index) => ({
        id: (index + 1).toString(),
        bookingCode: `TIX-${(index + 1)}${String.fromCharCode(65 + index)}${(index + 2)}${String.fromCharCode(66 + index)}`,
        trainName: train.name,
        trainClass: train.classes[0]?.name === 'Executive' ? TrainClass.Executive : 
                   train.classes[0]?.name === 'Business' ? TrainClass.Luxury : TrainClass.Economy,
        route: { from: train.route.from.city, to: train.route.to.city },
        departure: { 
            station: train.route.from.name, 
            time: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) 
        },
        arrival: { 
            station: train.route.to.name, 
            time: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000) 
        },
        passengers: [{ name: 'User', id: '1' }],
        price: train.classes[0]?.price || 100000,
        isActive: false
    }));
};

const MOCK_TICKETS: Ticket[] = generateMockTickets();

const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg">
        <div className="p-4">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">{ticket.bookingCode}</span>
                <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">{ticket.trainClass}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{ticket.trainName}</h3>
            <div className="flex items-center justify-between mt-2 text-gray-700 dark:text-gray-300">
                <span>{ticket.route.from}</span>
                <ArrowRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span>{ticket.route.to}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ticket.departure.time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 flex justify-end space-x-2">
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"><DownloadIcon className="w-5 h-5" /></button>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"><RebookIcon className="w-5 h-5" /></button>
        </div>
    </div>
);

// BookedTicketCard component
const BookedTicketCard: React.FC<{ ticket: BookedTicket }> = ({ ticket }) => {
    const formatTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">{ticket.trainName}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status === 'active' ? 'Aktif' :
                             ticket.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {ticket.departureStation} → {ticket.arrivalStation}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(ticket.departureTime)} - {formatTime(ticket.arrivalTime)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Penumpang: {ticket.passengerData.name}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                        Rp {ticket.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ticket.bookingCode}
                    </p>
                </div>
            </div>
        </div>
    );
};

const TicketsScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
    const [filters, setFilters] = useState<{ 
        month?: number; 
        year?: number; 
        text?: string;
        serviceType?: string;
        trainClass?: string;
        priceRange?: { min: number; max: number };
        timeRange?: { start: string; end: string };
        route?: { from: string; to: string };
    }>({});
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [showSearchExamples, setShowSearchExamples] = useState(true);
    const [bookedTickets, setBookedTickets] = useState<BookedTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<BookedTicket | null>(null);
    const [showTicketDetail, setShowTicketDetail] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    // Filter management functions
    const updateFilter = (key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilter = (key: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[key as keyof typeof newFilters];
            return newFilters;
        });
    };

    const clearAllFilters = () => {
        setFilters({});
        setActiveFilters([]);
    };

    const getActiveFiltersCount = () => {
        return Object.keys(filters).filter(key => filters[key as keyof typeof filters] !== undefined).length;
    };

    // Update active filters list
    useEffect(() => {
        const newActiveFilters: string[] = [];
        
        if (filters.month) newActiveFilters.push(`Bulan ${filters.month}`);
        if (filters.year) newActiveFilters.push(`Tahun ${filters.year}`);
        if (filters.serviceType) newActiveFilters.push(filters.serviceType);
        if (filters.trainClass) newActiveFilters.push(filters.trainClass);
        if (filters.priceRange) newActiveFilters.push(`Harga Rp${filters.priceRange.min.toLocaleString()} - Rp${filters.priceRange.max.toLocaleString()}`);
        if (filters.timeRange) newActiveFilters.push(`Waktu ${filters.timeRange.start} - ${filters.timeRange.end}`);
        if (filters.route?.from || filters.route?.to) {
            const routeText = filters.route.from && filters.route.to 
                ? `${filters.route.from} → ${filters.route.to}`
                : filters.route.from || filters.route.to || '';
            newActiveFilters.push(`Rute ${routeText}`);
        }
        
        setActiveFilters(newActiveFilters);
    }, [filters]);

    // Load booked tickets from localStorage
    useEffect(() => {
        const savedTickets = localStorage.getItem('bookedTickets');
        if (savedTickets) {
            setBookedTickets(JSON.parse(savedTickets));
        }
    }, []);

    const handleTicketClick = (ticket: BookedTicket) => {
        setSelectedTicket(ticket);
        setShowTicketDetail(true);
    };

    const closeTicketDetail = () => {
        setShowTicketDetail(false);
        setSelectedTicket(null);
    };

    // Setup voice recognition
    useEffect(() => {
        // Check if browser supports speech recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setBrowserSupportsSpeechRecognition(true);
        }
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

        recognition.onresult = (event: any) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
            setSearchQuery(currentTranscript);
            handleAISearch(currentTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.start();
    };

    const stopListening = () => {
        if (browserSupportsSpeechRecognition) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            SpeechRecognition.stopListening();
        }
    };

    // Effect untuk handle transcript changes (voice recognition)
    useEffect(() => {
        if (transcript && transcript.trim()) {
            console.log('Transcript received:', transcript);
            handleAISearch(transcript);
        }
    }, [transcript]);

    const parseSearchQuery = (query: string) => {
        const lowerQuery = query.toLowerCase();
        
        // Extract month names
        const monthMap: { [key: string]: number } = {
            'januari': 1, 'january': 1, 'jan': 1,
            'februari': 2, 'february': 2, 'feb': 2,
            'maret': 3, 'march': 3, 'mar': 3,
            'april': 4, 'apr': 4,
            'mei': 5, 'may': 5,
            'juni': 6, 'june': 6, 'jun': 6,
            'juli': 7, 'july': 7, 'jul': 7,
            'agustus': 8, 'august': 8, 'aug': 8,
            'september': 9, 'sep': 9, 'sept': 9,
            'oktober': 10, 'october': 10, 'oct': 10,
            'november': 11, 'nov': 11,
            'desember': 12, 'december': 12, 'dec': 12
        };

        // Extract year
        const yearMatch = lowerQuery.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : null;

        // Extract month
        let month: number | undefined;
        for (const [monthName, monthNum] of Object.entries(monthMap)) {
            if (lowerQuery.includes(monthName)) {
                month = monthNum;
                break;
            }
        }

        // Extract train names
        const trainKeywords = ['argo', 'jayabaya', 'taksaka', 'serayu', 'bromo', 'anggrek'];
        const trainName = trainKeywords.find(keyword => lowerQuery.includes(keyword));

        // Extract routes
        const routeKeywords = ['jakarta', 'surabaya', 'yogyakarta', 'malang', 'purwokerto', 'bandung'];
        const fromLocation = routeKeywords.find(location => 
            lowerQuery.includes(`dari ${location}`) || 
            lowerQuery.includes(`${location} ke`)
        );
        const toLocation = routeKeywords.find(location => 
            lowerQuery.includes(`ke ${location}`) || 
            lowerQuery.includes(`tujuan ${location}`)
        );

        // Extract booking code
        const bookingCodeMatch = lowerQuery.match(/(tix-[a-z0-9]+)/i);
        const bookingCode = bookingCodeMatch ? bookingCodeMatch[1].toUpperCase() : null;

        // Extract price range
        const priceMatch = lowerQuery.match(/(\d+)\s*(?:rb|ribu|k|000)/);
        const maxPrice = priceMatch ? parseInt(priceMatch[1]) * 1000 : null;

        return {
            month,
            year,
            trainName,
            fromLocation,
            toLocation,
            bookingCode,
            maxPrice,
            originalQuery: query
        };
    };

    const handleAISearch = async (query: string) => {
        if (!query.trim()) {
            setFilters({});
            return;
        }

        // Try AI interpretation first
        try {
        const interpretedFilters = await interpretSearchQuery(query);
        if (interpretedFilters) {
            setFilters(interpretedFilters);
                return;
            }
        } catch (error) {
            console.log('AI interpretation failed, using local parsing');
        }

        // Fallback to local natural language parsing
        const parsed = parseSearchQuery(query);
        const newFilters: { month?: number; year?: number; text?: string } = {};

        if (parsed.month) newFilters.month = parsed.month;
        if (parsed.year) newFilters.year = parsed.year;
        
        // Build text filter from various components
        const textComponents = [];
        if (parsed.trainName) textComponents.push(parsed.trainName);
        if (parsed.fromLocation) textComponents.push(parsed.fromLocation);
        if (parsed.toLocation) textComponents.push(parsed.toLocation);
        if (parsed.bookingCode) textComponents.push(parsed.bookingCode);
        
        if (textComponents.length > 0) {
            newFilters.text = textComponents.join(' ');
        }

        setFilters(newFilters);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        // Clear existing timeout
        if ((window as any).searchTimeout) {
            clearTimeout((window as any).searchTimeout);
        }
        
        if (query.length === 0) {
            setFilters({});
        } else {
            // Debounce AI search to avoid too many API calls
            (window as any).searchTimeout = setTimeout(() => {
                handleAISearch(query);
            }, 500);
        }
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAISearch(searchQuery);
    }

    const filteredTickets = useMemo(() => {
        return bookedTickets.filter(ticket => {
            // If no search query and no filters, show all tickets
            if (!searchQuery && Object.keys(filters).length === 0) {
                return true;
            }

            // Parse current query for additional filtering
            const parsedQuery = searchQuery ? parseSearchQuery(searchQuery) : null;

            // Date filters
            const ticketDate = new Date(ticket.departureTime);
            const matchMonth = !filters.month && !parsedQuery?.month || 
                ticketDate.getMonth() + 1 === (filters.month || parsedQuery?.month);
            const matchYear = !filters.year && !parsedQuery?.year || 
                ticketDate.getFullYear() === (filters.year || parsedQuery?.year);
            
            // Text filters
            const lowerCaseText = filters.text?.toLowerCase() || '';
            const matchText = !filters.text ||
                ticket.trainName.toLowerCase().includes(lowerCaseText) ||
                ticket.departureStation.toLowerCase().includes(lowerCaseText) ||
                ticket.arrivalStation.toLowerCase().includes(lowerCaseText) ||
                ticket.bookingCode.toLowerCase().includes(lowerCaseText);
            
            // Service type filter
            let matchServiceType = true;
            if (filters.serviceType) {
                const serviceType = filters.serviceType.toLowerCase();
                const trainName = ticket.trainName.toLowerCase();
                
                // Debug log for service type filtering
                console.log(`Filtering by service type "${serviceType}" for train "${trainName}"`);
                
                if (serviceType === 'inter city') {
                    // Check for Inter City trains (premium trains)
                    matchServiceType = trainName.includes('argo') ||
                        trainName.includes('taksaka') ||
                        trainName.includes('gajayana') ||
                        trainName.includes('bima') ||
                        trainName.includes('sembrani') ||
                        trainName.includes('bangunkarta') ||
                        trainName.includes('mutiara') ||
                        trainName.includes('rajawali') ||
                        trainName.includes('malioboro') ||
                        trainName.includes('bromo') ||
                        trainName.includes('anggrek');
                    
                    console.log(`Inter City filter result: ${matchServiceType} for train: ${trainName}`);
                } else if (serviceType === 'local') {
                    // Check for Local trains
                    matchServiceType = trainName.includes('jayabaya') ||
                        trainName.includes('kalijaga') ||
                        trainName.includes('mataram') ||
                        trainName.includes('blambangan');
                } else if (serviceType === 'commuter line') {
                    // Check for Commuter Line trains
                    matchServiceType = trainName.includes('lin') ||
                        trainName.includes('commuter');
                } else {
                    // Generic match for any other service type
                    matchServiceType = trainName.includes(serviceType);
                }
            }

            // Train class filter
            let matchTrainClass = true;
            if (filters.trainClass) {
                const filterClass = filters.trainClass.toLowerCase();
                const ticketClass = ticket.trainClass.toLowerCase();
                
                matchTrainClass = ticketClass === filterClass ||
                    ticketClass.includes(filterClass) ||
                    (filterClass === 'ekonomi' && ticketClass === 'economy') ||
                    (filterClass === 'bisnis' && ticketClass === 'business') ||
                    (filterClass === 'eksekutif' && ticketClass === 'executive');
            }

            // Price range filter
            const matchPriceRange = !filters.priceRange ||
                (!filters.priceRange.min || ticket.price >= filters.priceRange.min) &&
                (!filters.priceRange.max || ticket.price <= filters.priceRange.max);

            // Route filter
            const matchRoute = !filters.route ||
                (!filters.route.from || ticket.departureStation.toLowerCase().includes(filters.route.from.toLowerCase())) &&
                (!filters.route.to || ticket.arrivalStation.toLowerCase().includes(filters.route.to.toLowerCase()));

            // Specific train name filter
            const matchTrainName = !parsedQuery?.trainName ||
                ticket.trainName.toLowerCase().includes(parsedQuery.trainName.toLowerCase());

            // Route filters
            const matchFromLocation = !parsedQuery?.fromLocation ||
                ticket.departureStation.toLowerCase().includes(parsedQuery.fromLocation.toLowerCase());
            const matchToLocation = !parsedQuery?.toLocation ||
                ticket.arrivalStation.toLowerCase().includes(parsedQuery.toLocation.toLowerCase());

            // Booking code filter
            const matchBookingCode = !parsedQuery?.bookingCode ||
                ticket.bookingCode.toLowerCase().includes(parsedQuery.bookingCode.toLowerCase());

            // Price filter
            const matchPrice = !parsedQuery?.maxPrice ||
                ticket.price <= parsedQuery.maxPrice;

            // Combine all filters
            return matchMonth && matchYear && matchText && matchServiceType && matchTrainClass && 
                   matchPriceRange && matchRoute && matchTrainName && matchFromLocation && 
                   matchToLocation && matchBookingCode && matchPrice;
        });
    }, [filters, searchQuery, bookedTickets]);

    // Filter tickets by active/history status
    const activeTickets = filteredTickets.filter(ticket => ticket.status === 'active');
    const historyTickets = filteredTickets.filter(ticket => ticket.status !== 'active');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
                <div className="flex items-center justify-start">
                    <div className="p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold">Tiket Saya</h1>
                    <div></div>
                </div>
                <p className="text-sm opacity-90 mt-2 ml-10">Kelola tiket aktif dan riwayat perjalanan Anda</p>
            </div>

        <div className="p-4 space-y-4">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'active'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    Tiket Aktif ({activeTickets.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'history'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    Riwayat ({historyTickets.length})
                </button>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative flex items-center">
                <input
                    type="text"
                    placeholder={isListening ? "Mendengarkan..." : "Cari tiket..."}
                    value={transcript || searchQuery}
                    onChange={handleSearchChange}
                    className={`w-full pl-10 pr-20 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${isListening ? 'animate-pulse' : ''}`}
                />
                <SearchIcon className="absolute left-3 w-5 h-5 text-gray-400" />
                <div className="absolute right-3 flex items-center space-x-1">
                        {/* Clear Button */}
                        {searchQuery && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilters({});
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                title="Clear search"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        <button 
                            type="button" 
                            onClick={isListening ? stopListening : startListening}
                            className={`p-2 rounded-full transition-colors ${
                                isListening 
                                    ? 'bg-red-500 text-white animate-pulse' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            } ${!browserSupportsSpeechRecognition ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={browserSupportsSpeechRecognition 
                                ? (isListening ? 'Stop listening' : 'Start voice search')
                                : 'Voice recognition not supported'
                            }
                            disabled={!browserSupportsSpeechRecognition}
                        >
                            {isListening ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h12v12H6z"/>
                                </svg>
                            ) : (
                        <MicrophoneIcon className="w-5 h-5" />
                            )}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`p-2 rounded-full transition-colors relative ${
                            showFilterMenu || getActiveFiltersCount() > 0
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        title="Filter tiket"
                    >
                        <FilterIcon className="w-5 h-5" />
                        {getActiveFiltersCount() > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </button>
                </div>
                </div>

                {/* Filter Menu */}
                {showFilterMenu && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Filter Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <FilterIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Filter Tiket</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Saring tiket berdasarkan kriteria</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFilterMenu(false)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                                    title="Tutup filter"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Filter Content */}
                        <div className="p-6">
                            {/* Filter Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Service Type Filter */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            Jenis Layanan
                                        </label>
                                        <select
                                            value={filters.serviceType || ''}
                                            onChange={(e) => updateFilter('serviceType', e.target.value || undefined)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                                        >
                                            <option value="">🚂 Semua Layanan</option>
                                            <option value="Inter City">🚄 Inter City</option>
                                            <option value="Local">🚃 Local</option>
                                            <option value="Commuter Line">🚊 Commuter Line</option>
                                        </select>
                                    </div>

                                    {/* Train Class Filter */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            Kelas Kereta
                                        </label>
                                        <select
                                            value={filters.trainClass || ''}
                                            onChange={(e) => updateFilter('trainClass', e.target.value || undefined)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                                        >
                                            <option value="">💺 Semua Kelas</option>
                                            <option value="Ekonomi">🟢 Ekonomi</option>
                                            <option value="Bisnis">🔵 Bisnis</option>
                                            <option value="Eksekutif">🟣 Eksekutif</option>
                                            <option value="Luxury">🟡 Luxury</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Price Range Filter */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            Rentang Harga
                                        </label>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="Min (Rp)"
                                                    value={filters.priceRange?.min || ''}
                                                    onChange={(e) => updateFilter('priceRange', {
                                                        ...filters.priceRange,
                                                        min: e.target.value ? parseInt(e.target.value) : undefined
                                                    })}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                                                />
                                            </div>
                                            <div className="flex items-center text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="Max (Rp)"
                                                    value={filters.priceRange?.max || ''}
                                                    onChange={(e) => updateFilter('priceRange', {
                                                        ...filters.priceRange,
                                                        max: e.target.value ? parseInt(e.target.value) : undefined
                                                    })}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Route Filter */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Rute Perjalanan
                                        </label>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Stasiun Asal"
                                                    value={filters.route?.from || ''}
                                                    onChange={(e) => updateFilter('route', {
                                                        ...filters.route,
                                                        from: e.target.value || undefined
                                                    })}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                                                />
                                            </div>
                                            <div className="flex items-center text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Stasiun Tujuan"
                                                    value={filters.route?.to || ''}
                                                    onChange={(e) => updateFilter('route', {
                                                        ...filters.route,
                                                        to: e.target.value || undefined
                                                    })}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {activeFilters.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                Filter Aktif ({activeFilters.length})
                                            </span>
                                        </div>
                                        <button
                                            onClick={clearAllFilters}
                                            className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Hapus Semua
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {activeFilters.map((filter, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-lg border border-blue-200 dark:border-blue-700"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {filter}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Filter Actions */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reset Filter
                                </button>
                                <button
                                    onClick={() => setShowFilterMenu(false)}
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Terapkan Filter
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Examples */}
                {showSearchExamples && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowSearchExamples(false)}
                            className="absolute top-2 right-2 p-1 text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full transition-all duration-200 group"
                            title="Tutup contoh pencarian"
                        >
                            <svg className="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="pr-6">
                            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                🔍 Contoh Pencarian Natural Language:
                            </h4>
                            <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                                <p>• "tiket bulan desember" - Cari tiket di bulan Desember</p>
                                <p>• "kereta argo bromo" - Cari tiket kereta Argo Bromo</p>
                                <p>• "jakarta ke yogyakarta" - Cari tiket rute Jakarta-Yogyakarta</p>
                                <p>• "tahun 2024" - Cari tiket tahun 2024</p>
                                <p>• "TIX-1234" - Cari dengan kode booking</p>
                            </div>
                        </div>
                    </div>
                )}
            </form>

            <div className="space-y-4">
                {activeTab === 'active' ? (
                    activeTickets.length > 0 ? (
                        activeTickets.map(ticket => (
                            <div key={ticket.id} onClick={() => handleTicketClick(ticket)} className="cursor-pointer">
                                <BookedTicketCard ticket={ticket} />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">Belum ada tiket aktif</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Pesan tiket kereta untuk melihatnya di sini</p>
                        </div>
                    )
                ) : (
                    historyTickets.length > 0 ? (
                        historyTickets.map(ticket => (
                            <div key={ticket.id} onClick={() => handleTicketClick(ticket)} className="cursor-pointer">
                                <BookedTicketCard ticket={ticket} />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">Belum ada riwayat tiket</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Riwayat perjalanan akan muncul di sini</p>
                        </div>
                    )
                )}
            </div>

            {/* Ticket Detail Modal */}
            {showTicketDetail && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detail Tiket</h3>
                                <button 
                                    onClick={closeTicketDetail}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Kode Booking</h4>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{selectedTicket.bookingCode}</p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Informasi Perjalanan</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Kereta:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{selectedTicket.trainName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Kelas:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{selectedTicket.trainClass}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Rute:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{selectedTicket.departureStation} → {selectedTicket.arrivalStation}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Keberangkatan:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedTicket.departureTime).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Kedatangan:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedTicket.arrivalTime).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Harga:</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">Rp {selectedTicket.price.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">Status:</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                selectedTicket.status === 'active' ? 'bg-green-100 text-green-800' :
                                                selectedTicket.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {selectedTicket.status === 'active' ? 'Aktif' :
                                                 selectedTicket.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">Data Penumpang</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-green-600 dark:text-green-400">Nama:</span>
                                            <span className="font-medium text-green-900 dark:text-green-200">{selectedTicket.passengerData.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-green-600 dark:text-green-400">NIK:</span>
                                            <span className="font-medium text-green-900 dark:text-green-200">{selectedTicket.passengerData.nik}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-green-600 dark:text-green-400">Telepon:</span>
                                            <span className="font-medium text-green-900 dark:text-green-200">{selectedTicket.passengerData.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button 
                                        onClick={closeTicketDetail}
                                        className="flex-1 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Tutup
                                    </button>
                                    <button 
                                        onClick={() => {
                                            alert('Fitur download akan segera tersedia!');
                                        }}
                                        className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Download Tiket
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default TicketsScreen;