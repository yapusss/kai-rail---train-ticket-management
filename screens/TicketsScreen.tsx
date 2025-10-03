import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, TrainClass, BookedTicket } from '../types';
import { interpretSearchQuery } from '../services/geminiService';
import { SearchIcon, MicrophoneIcon, FilterIcon, DownloadIcon, RebookIcon, ArrowRightIcon } from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';
import Swal from 'sweetalert2';

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
    const [bookedTickets, setBookedTickets] = useState<BookedTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<BookedTicket | null>(null);
    const [showTicketDetail, setShowTicketDetail] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

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

    const recognition = useMemo(() => {
        if ('webkitSpeechRecognition' in window) {
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

        const yearMatch = lowerQuery.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : null;

        let month: number | undefined;
        for (const [monthName, monthNum] of Object.entries(monthMap)) {
            if (lowerQuery.includes(monthName)) {
                month = monthNum;
                break;
            }
        }

        const trainKeywords = ['argo', 'jayabaya', 'taksaka', 'serayu', 'bromo', 'anggrek'];
        const trainName = trainKeywords.find(keyword => lowerQuery.includes(keyword));

        const routeKeywords = ['jakarta', 'surabaya', 'yogyakarta', 'malang', 'purwokerto', 'bandung'];
        const fromLocation = routeKeywords.find(location => 
            lowerQuery.includes(`dari ${location}`) || 
            lowerQuery.includes(`${location} ke`)
        );
        const toLocation = routeKeywords.find(location => 
            lowerQuery.includes(`ke ${location}`) || 
            lowerQuery.includes(`tujuan ${location}`)
        );

        const bookingCodeMatch = lowerQuery.match(/(tix-[a-z0-9]+)/i);
        const bookingCode = bookingCodeMatch ? bookingCodeMatch[1].toUpperCase() : null;

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

        try {
            const interpretedFilters = await interpretSearchQuery(query);
            if (interpretedFilters) {
                setFilters(interpretedFilters);
                return;
            }
        } catch (error) {
            console.log('AI interpretation failed, using local parsing');
        }

        const parsed = parseSearchQuery(query);
        const newFilters: { month?: number; year?: number; text?: string } = {};

        if (parsed.month) newFilters.month = parsed.month;
        if (parsed.year) newFilters.year = parsed.year;
        
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
        
        if ((window as any).searchTimeout) {
            clearTimeout((window as any).searchTimeout);
        }
        
        if (query.length === 0) {
            setFilters({});
        } else {
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
        return MOCK_TICKETS.filter(ticket => {
            if (!searchQuery && Object.keys(filters).length === 0) {
                return true;
            }

            const parsedQuery = searchQuery ? parseSearchQuery(searchQuery) : null;

            const matchMonth = !filters.month && !parsedQuery?.month || 
                ticket.departure.time.getMonth() + 1 === (filters.month || parsedQuery?.month);
            const matchYear = !filters.year && !parsedQuery?.year || 
                ticket.departure.time.getFullYear() === (filters.year || parsedQuery?.year);
            
            const lowerCaseText = filters.text?.toLowerCase() || '';
            const matchText = !filters.text ||
                ticket.trainName.toLowerCase().includes(lowerCaseText) ||
                ticket.route.from.toLowerCase().includes(lowerCaseText) ||
                ticket.route.to.toLowerCase().includes(lowerCaseText) ||
                ticket.bookingCode.toLowerCase().includes(lowerCaseText);

            const matchTrainName = !parsedQuery?.trainName ||
                ticket.trainName.toLowerCase().includes(parsedQuery.trainName.toLowerCase());

            const matchFromLocation = !parsedQuery?.fromLocation ||
                ticket.route.from.toLowerCase().includes(parsedQuery.fromLocation.toLowerCase());
            const matchToLocation = !parsedQuery?.toLocation ||
                ticket.route.to.toLowerCase().includes(parsedQuery.toLocation.toLowerCase());

            const matchBookingCode = !parsedQuery?.bookingCode ||
                ticket.bookingCode.toLowerCase().includes(parsedQuery.bookingCode.toLowerCase());

            const matchPrice = !parsedQuery?.maxPrice ||
                ticket.price <= parsedQuery.maxPrice;

            return matchMonth && matchYear && matchText && matchTrainName && 
                   matchFromLocation && matchToLocation && matchBookingCode && matchPrice;
        });
    }, [filters, searchQuery]);

    const activeTickets = bookedTickets.filter(ticket => ticket.status === 'active');
    const historyTickets = bookedTickets.filter(ticket => ticket.status !== 'active');

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tiket Saya</h2>
            
        {}
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
                        placeholder="Cari tiket..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-20 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                    <SearchIcon className="absolute left-3 w-5 h-5 text-gray-400" />
                    <div className="absolute right-3 flex items-center space-x-1">
        {}
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
                        <button type="button" onClick={handleVoiceSearch} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                        <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                            <FilterIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

        {}
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

        {}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
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

        {}
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
                                            Swal.fire({
                                                icon: 'info',
                                                title: 'Info',
                                                text: 'Fitur download akan segera tersedia!',
                                                confirmButtonText: 'OK'
                                            });
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
    );
};

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

export default TicketsScreen;