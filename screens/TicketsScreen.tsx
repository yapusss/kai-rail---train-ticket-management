import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, TrainClass } from '../types';
import { interpretSearchQuery } from '../services/geminiService';
import { SearchIcon, MicrophoneIcon, FilterIcon, DownloadIcon, RebookIcon, ArrowRightIcon } from '../components/icons/FeatureIcons';
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

const TicketsScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [filters, setFilters] = useState<{ month?: number; year?: number; text?: string }>({});

    const recognition = useMemo(() => {
        if ('webkitSpeechRecognition' in window) {
            // FIX: Cast window to `any` to access the non-standard `webkitSpeechRecognition` property
            // without causing a TypeScript error. This allows `new SpeechRecognition()` to work correctly.
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.lang = 'id-ID';
            rec.interimResults = false;
            return rec;
        }
        return null;
    }, []);

    const handleVoiceSearch = () => {
        if (recognition && !isListening) {
            recognition.start();
            setIsListening(true);
        }
    };

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            handleAISearch(transcript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
    }, [recognition]);

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
        if (query.length === 0) {
            setFilters({});
        }
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAISearch(searchQuery);
    }

    const filteredTickets = useMemo(() => {
        return MOCK_TICKETS.filter(ticket => {
            // If no search query and no filters, show all tickets
            if (!searchQuery && Object.keys(filters).length === 0) {
                return true;
            }

            // Parse current query for additional filtering
            const parsedQuery = searchQuery ? parseSearchQuery(searchQuery) : null;

            // Date filters
            const matchMonth = !filters.month && !parsedQuery?.month || 
                ticket.departure.time.getMonth() + 1 === (filters.month || parsedQuery?.month);
            const matchYear = !filters.year && !parsedQuery?.year || 
                ticket.departure.time.getFullYear() === (filters.year || parsedQuery?.year);
            
            // Text filters
            const lowerCaseText = filters.text?.toLowerCase() || '';
            const matchText = !filters.text ||
                ticket.trainName.toLowerCase().includes(lowerCaseText) ||
                ticket.route.from.toLowerCase().includes(lowerCaseText) ||
                ticket.route.to.toLowerCase().includes(lowerCaseText) ||
                ticket.bookingCode.toLowerCase().includes(lowerCaseText);

            // Specific train name filter
            const matchTrainName = !parsedQuery?.trainName ||
                ticket.trainName.toLowerCase().includes(parsedQuery.trainName.toLowerCase());

            // Route filters
            const matchFromLocation = !parsedQuery?.fromLocation ||
                ticket.route.from.toLowerCase().includes(parsedQuery.fromLocation.toLowerCase());
            const matchToLocation = !parsedQuery?.toLocation ||
                ticket.route.to.toLowerCase().includes(parsedQuery.toLocation.toLowerCase());

            // Booking code filter
            const matchBookingCode = !parsedQuery?.bookingCode ||
                ticket.bookingCode.toLowerCase().includes(parsedQuery.bookingCode.toLowerCase());

            // Price filter
            const matchPrice = !parsedQuery?.maxPrice ||
                ticket.price <= parsedQuery.maxPrice;

            // Combine all filters
            return matchMonth && matchYear && matchText && matchTrainName && 
                   matchFromLocation && matchToLocation && matchBookingCode && matchPrice;
        });
    }, [filters, searchQuery]);

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Riwayat Tiket</h2>
            
            <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder="Cari tiket..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-16 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                    <SearchIcon className="absolute left-3 w-5 h-5 text-gray-400" />
                    <div className="absolute right-3 flex items-center space-x-1">
                        <button type="button" onClick={handleVoiceSearch} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                        <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                            <FilterIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Voice Recognition Status */}
                {recognition && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <span>Voice Search:</span>
                        <span className={isListening ? "text-green-600" : "text-red-600"}>
                            {isListening ? "Mendengarkan..." : "Tidak aktif"}
                        </span>
                        {searchQuery && (
                            <span className="text-gray-400">
                                "{searchQuery}"
                            </span>
                        )}
                    </div>
                )}
            </form>

            <div className="space-y-4">
                {filteredTickets.length > 0 ? (
                    filteredTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 pt-8">Tidak ada tiket yang cocok.</p>
                )}
            </div>
        </div>
    );
};

export default TicketsScreen;