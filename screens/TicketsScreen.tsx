import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, TrainClass, BookedTicket, NavigationTab } from '../types';
import { interpretSearchQuery } from '../services/geminiService';
import { SearchIcon, MicrophoneIcon, FilterIcon, DownloadIcon, RebookIcon, ArrowRightIcon } from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';
import Swal from 'sweetalert2';
import { useAccessibility } from '../hooks/useAccessibility';
import { voiceConflictManager } from '../services/voiceConflictManager';

const generateMockTickets = (): Ticket[] => {
    const trains = TrainDataService.getInterCityTrains().concat(TrainDataService.getLokalTrains());
    return trains.slice(0, 4).map((train, index) => ({
        id: (index + 1).toString(),
        bookingCode: `TIX-${(index + 1)}${String.fromCharCode(65 + index)}${(index + 2)}${String.fromCharCode(66 + index)}`,
        trainName: train.name,
        trainClass: train.classes[0]?.name === 'Executive' ? TrainClass.Executive : 
                   train.classes[0]?.name === 'Business' ? TrainClass.Luxury : TrainClass.Economy,
        route: { from: train.route.from.city, to: train.route.to.city },
        departure: { 
            station: train.route.from.name, 
            time: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) 
        },
        arrival: { 
            station: train.route.to.name, 
            time: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000) 
        },
        passengers: [{ name: 'User', id: '1' }],
        price: train.classes[0]?.price || 100000,
        isActive: false
    }));
};

const MOCK_TICKETS: Ticket[] = generateMockTickets();

const generateDummyBookedTickets = (): BookedTicket[] => {
    const trains = TrainDataService.getInterCityTrains().concat(TrainDataService.getLokalTrains());
    const dummyTickets: BookedTicket[] = [];
    
    const activeTickets = [
        {
            trainName: 'Argo Bromo Anggrek',
            trainClass: TrainClass.Executive,
            departureStation: 'Gambir',
            arrivalStation: 'Surabaya Gubeng',
            departureTime: new Date('2024-12-25T08:00:00'),
            arrivalTime: new Date('2024-12-25T16:00:00'),
            price: 450000,
            bookingCode: 'TIX-AB1234',
            passengerData: {
                name: 'Ahmad Rizki',
                nik: '3201234567890123',
                phone: '081234567890'
            },
            bookingDate: new Date('2024-12-20T10:00:00').toISOString(), 
            status: 'active' as const
        },
        {
            trainName: 'Kereta Api Jayabaya',
            trainClass: TrainClass.Business,
            departureStation: 'Jakarta Kota',
            arrivalStation: 'Surabaya Pasar Turi',
            departureTime: new Date('2024-12-30T10:00:00'),
            arrivalTime: new Date('2024-12-30T22:00:00'), 
            price: 320000,
            bookingCode: 'TIX-JB5678',
            passengerData: {
                name: 'Siti Nurhaliza',
                nik: '3209876543210987',
                phone: '081987654321'
            },
            bookingDate: new Date('2024-12-27T15:30:00').toISOString(),
            status: 'active' as const
        },
        {
            trainName: 'Kereta Api Taksaka',
            trainClass: TrainClass.Executive,
            departureStation: 'Gambir',
            arrivalStation: 'Yogyakarta',
            departureTime: new Date('2025-01-06T07:00:00'), 
            arrivalTime: new Date('2025-01-06T14:00:00'),
            price: 280000,
            bookingCode: 'TIX-TK9012',
            passengerData: {
                name: 'Budi Santoso',
                nik: '3201122334455667',
                phone: '0812233445566'
            },
            bookingDate: new Date('2025-01-05T09:15:00').toISOString(),
            status: 'active' as const
        }
    ];

    const historyTickets = [
        {
            trainName: 'Kereta Api Serayu',
            trainClass: TrainClass.Economy,
            departureStation: 'Jakarta Kota',
            arrivalStation: 'Purwokerto',
            departureTime: new Date('2024-11-15T09:00:00'),
            arrivalTime: new Date('2024-11-15T15:00:00'), 
            price: 150000,
            bookingCode: 'TIX-SR3456',
            passengerData: {
                name: 'Dewi Kartika',
                nik: '3209988776655443',
                phone: '081998877665'
            },
            bookingDate: new Date('2024-11-10T14:20:00').toISOString(),
            status: 'completed' as const
        },
        {
            trainName: 'Kereta Api Argo Lawu',
            trainClass: TrainClass.Executive,
            departureStation: 'Gambir',
            arrivalStation: 'Solo Balapan',
            departureTime: new Date('2024-11-01T08:30:00'), 
            arrivalTime: new Date('2024-11-01T15:30:00'),
            price: 380000,
            bookingCode: 'TIX-AL7890',
            passengerData: {
                name: 'Rizki Pratama',
                nik: '3205566778899001',
                phone: '081556677889'
            },
            bookingDate: new Date('2024-10-25T11:45:00').toISOString(), 
            status: 'completed' as const
        },
        {
            trainName: 'Kereta Api Bima',
            trainClass: TrainClass.Business,
            departureStation: 'Jakarta Kota',
            arrivalStation: 'Surabaya Pasar Turi',
            departureTime: new Date('2024-10-15T14:00:00'), 
            arrivalTime: new Date('2024-10-16T00:00:00'), 
            price: 290000,
            bookingCode: 'TIX-BM2468',
            passengerData: {
                name: 'Maya Sari',
                nik: '3203344556677889',
                phone: '081334455667'
            },
            bookingDate: new Date('2024-10-10T16:30:00').toISOString(),
            status: 'cancelled' as const
        },
        {
            trainName: 'Kereta Api Gajayana',
            trainClass: TrainClass.Economy,
            departureStation: 'Jakarta Kota',
            arrivalStation: 'Malang',
            departureTime: new Date('2024-09-20T12:00:00'), 
            arrivalTime: new Date('2024-09-21T02:00:00'), 
            price: 180000,
            bookingCode: 'TIX-GJ1357',
            passengerData: {
                name: 'Andi Wijaya',
                nik: '3207788990011223',
                phone: '081778899001'
            },
            bookingDate: new Date('2024-09-15T13:10:00').toISOString(),
            status: 'completed' as const
        }
    ];

    [...activeTickets, ...historyTickets].forEach((ticket, index) => {
        dummyTickets.push({
            id: (index + 1).toString(),
            bookingCode: ticket.bookingCode,
            trainName: ticket.trainName,
            trainClass: ticket.trainClass,
            route: {
                from: ticket.departureStation,
                to: ticket.arrivalStation
            },
            departure: {
                station: ticket.departureStation,
                time: ticket.departureTime
            },
            arrival: {
                station: ticket.arrivalStation,
                time: ticket.arrivalTime
            },
            passengers: [{ name: ticket.passengerData.name, id: ticket.passengerData.nik }],
            price: ticket.price,
            isActive: ticket.status === 'active',
            passengerData: ticket.passengerData,
            bookingDate: ticket.bookingDate,
            status: ticket.status
        });
    });

    return dummyTickets;
};

const DUMMY_BOOKED_TICKETS: BookedTicket[] = generateDummyBookedTickets();

const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg p-1">
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {(() => {
                    const date = new Date(ticket.departure.time);
                    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                })()}
            </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 flex justify-end space-x-2">
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"><DownloadIcon className="w-5 h-5" /></button>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"><RebookIcon className="w-5 h-5" /></button>
        </div>
    </div>
);

interface TicketsScreenProps {
    setActiveTab?: (tab: NavigationTab) => void;
}

const TicketsScreen: React.FC<TicketsScreenProps> = ({ setActiveTab: setParentActiveTab }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [filters, setFilters] = useState<{ month?: number; year?: number; text?: string }>({});
    const [bookedTickets, setBookedTickets] = useState<BookedTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<BookedTicket | null>(null);
    const [showTicketDetail, setShowTicketDetail] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [showSearchExamples, setShowSearchExamples] = useState(true);
    const [rating, setRating] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');

    const { announcePage, announceElement, announceAction, announceError, announceSuccess, settings } = useAccessibility();

    useEffect(() => {
        const savedTickets = localStorage.getItem('bookedTickets');
        if (savedTickets) {
            setBookedTickets(JSON.parse(savedTickets));
        } else {
            setBookedTickets(DUMMY_BOOKED_TICKETS);
            localStorage.setItem('bookedTickets', JSON.stringify(DUMMY_BOOKED_TICKETS));
        }

        if (settings.enabled) {
            announcePage({
                pageTitle: "Tiket Saya",
                pageDescription: "Halaman untuk melihat dan mengelola tiket kereta yang sudah dibeli. Di sini Anda dapat melihat detail tiket, mengunduh tiket, dan melakukan rebooking.",
                availableActions: [
                    "mencari tiket berdasarkan bulan, tahun, atau nama kereta",
                    "menggunakan perintah suara untuk pencarian tiket",
                    "melihat detail tiket yang sudah dibeli",
                    "mengunduh tiket dalam format PDF",
                    "melakukan rebooking tiket",
                    "mengganti tab antara tiket aktif dan riwayat"
                ],
                voiceInstructions: "Anda bisa menggunakan kotak pencarian untuk mencari tiket berdasarkan bulan seperti 'tiket bulan desember', tahun seperti 'tahun 2024', atau nama kereta seperti 'argo bromo'. Klik tombol mikrofon untuk pencarian dengan suara."
            });
        }
    }, [settings.enabled, announcePage]);

    const handleTicketClick = (ticket: BookedTicket) => {
        setSelectedTicket(ticket);
        setShowTicketDetail(true);
    };

    const closeTicketDetail = () => {
        setShowTicketDetail(false);
        setSelectedTicket(null);
        setRating(0);
        setFeedback('');
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
            voiceConflictManager.startVoiceCommand();
            
            recognition.start();
            setIsListening(true);
            announceAction("Mendengarkan perintah pencarian tiket", "Silakan sebutkan kriteria pencarian tiket");
        }
    };

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            handleAISearch(transcript);
            announceSuccess(`Pencarian tiket dengan suara: ${transcript}`);
        };

        recognition.onend = () => {
            setIsListening(false);
            announceAction("Pengenalan suara selesai");
            voiceConflictManager.endVoiceCommand();
        };
        
        recognition.onerror = (event: any) => {
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

    if (showTicketDetail && selectedTicket) {
        return (
            <div>
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl mb-6">
                    <div className="flex items-center justify-start">
                        <button
                            onClick={closeTicketDetail}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="ml-4">
                            <h1 className="text-xl font-bold">Detail Tiket</h1>
                            <p className="text-sm opacity-90">Informasi lengkap tiket Anda</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-4">
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
                                    <span className="font-medium text-gray-900 dark:text-white">{selectedTicket.departure.station} → {selectedTicket.arrival.station}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Keberangkatan:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {(() => {
                                            const date = new Date(selectedTicket.departure.time);
                                            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString('id-ID');
                                        })()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Kedatangan:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {(() => {
                                            const date = new Date(selectedTicket.arrival.time);
                                            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString('id-ID');
                                        })()}
                                    </span>
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

                        {}
                        {selectedTicket.status === 'completed' && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">Beri Rating & Feedback</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">Bagaimana pengalaman perjalanan Anda?</p>
                                        <div className="flex space-x-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    className={`transition-colors ${
                                                        star <= rating 
                                                            ? 'text-yellow-500' 
                                                            : 'text-gray-300 hover:text-yellow-400'
                                                    }`}
                                                >
                                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                        {rating > 0 && (
                                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                                Rating: {rating} bintang
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                                            Feedback (opsional)
                                        </label>
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="Bagikan pengalaman perjalanan Anda..."
                                            className="w-full p-3 border border-yellow-300 dark:border-yellow-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                                            rows={3}
                                        />
                                    </div>
                                    
                                    <button 
                                        onClick={() => {
                                            if (rating === 0) {
                                                Swal.fire({
                                                    icon: 'warning',
                                                    title: 'Pilih Rating',
                                                    text: 'Silakan berikan rating terlebih dahulu',
                                                    confirmButtonText: 'Baik'
                                                });
                                                return;
                                            }
                                            
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Feedback Terkirim!',
                                                html: `
                                                    <div class="text-left">
                                                        <p><strong>Rating:</strong> ${rating} bintang</p>
                                                        ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
                                                        <p class="mt-2">Terima kasih atas feedback Anda. Ini akan membantu kami meningkatkan layanan.</p>
                                                    </div>
                                                `,
                                                confirmButtonText: 'Baik'
                                            }).then(() => {
                                                setRating(0);
                                                setFeedback('');
                                            });
                                        }}
                                        className="w-full bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={rating === 0}
                                    >
                                        Kirim Feedback
                                    </button>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Informasi',
                                    text: 'Fitur download akan segera tersedia!',
                                    confirmButtonText: 'Baik'
                                });
                            }}
                            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Download Tiket
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
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

            <div className="p-4 space-y-6">
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
                    {showSearchExamples && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg relative">
{}
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
                                🔍 Contoh Pencarian:
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

            {}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Cek & Tambah Tiket</h3>
                    
            {}
                    <button 
                        onClick={() => {
                            if (setParentActiveTab) {
                                setParentActiveTab(NavigationTab.TicketCode);
                            } else {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Cek Tiket',
                                    text: 'Fitur untuk menambah tiket dengan scan QR atau input manual',
                                    confirmButtonText: 'Baik'
                                });
                            }
                        }}
                        className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 text-center mb-3"
                    >
                        <div className="flex items-center justify-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <div className="text-white text-left">
                                <p className="font-semibold text-lg">Cek Tiket</p>
                                <p className="text-xs opacity-90">Scan QR atau input manual</p>
                            </div>
                        </div>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        
                    </div>
                </div>

            {}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Layanan Tambahan</h3>
                    <div className="grid grid-cols-4 gap-4">
            {}
                        <button 
                            onClick={() => {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Railfood',
                                    text: 'Layanan pemesanan makanan dan minuman di dalam kereta',
                                    confirmButtonText: 'Baik'
                                });
                            }}
                            className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10Zm0-8a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>
                                    <path d="M2 10a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3H2v-3Z"/>
                                </svg>
                            </div>
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 text-center">Railfood</p>
                        </button>

            {}
                        <button 
                            onClick={() => {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Taksi Online',
                                    text: 'Layanan pemesanan taksi online dari dan ke stasiun',
                                    confirmButtonText: 'Baik'
                                });
                            }}
                            className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M2 8h12v5H2V8zm0-3h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>
                                    <circle cx="4" cy="14" r="1.5"/>
                                    <circle cx="12" cy="14" r="1.5"/>
                                </svg>
                            </div>
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 text-center">Taksi</p>
                        </button>

            {}
                        <button 
                            onClick={() => {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Bus Kota',
                                    text: 'Informasi dan pemesanan bus kota terintegrasi dengan perjalanan kereta',
                                    confirmButtonText: 'Baik'
                                });
                            }}
                            className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M2 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zm2-1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H4z"/>
                                    <rect x="3" y="4" width="10" height="2" rx="0.5"/>
                                    <rect x="4" y="6" width="8" height="4" rx="0.5"/>
                                    <circle cx="5" cy="13" r="1"/>
                                    <circle cx="11" cy="13" r="1"/>
                                </svg>
                            </div>
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 text-center">Bus</p>
                        </button>

            {}
                        <button 
                            onClick={() => {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Hotel Booking',
                                    text: 'Pemesanan hotel dekat stasiun dengan harga khusus untuk penumpang kereta',
                                    confirmButtonText: 'Baik'
                                });
                            }}
                            className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 text-center">Hotel</p>
                        </button>
                    </div>
                </div>

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
            </div>
        </div>
    );
};

const BookedTicketCard: React.FC<{ ticket: BookedTicket }> = ({ ticket }) => {
    const formatTime = (dateTime: string | Date | undefined) => {
        if (!dateTime) {
            Swal.fire({
              icon: 'warning',
              title: 'Data Tidak Valid',
              text: 'Tanggal tidak tersedia.',
              confirmButtonText: 'Baik'
            });
            return 'Invalid Date';
        }
        
        let date: Date;
        
        if (typeof dateTime === 'string') {
            if (dateTime.includes('T')) {
                date = new Date(dateTime);
            } else if (dateTime.includes('-')) {
                date = new Date(dateTime + 'T00:00:00');
            } else {
                date = new Date(dateTime);
            }
        } else {
            date = new Date(dateTime);
        }
        
        if (isNaN(date.getTime())) {
            Swal.fire({
              icon: 'warning',
              title: 'Data Tidak Valid',
              text: 'Format tanggal tidak valid.',
              confirmButtonText: 'Baik'
            });
            return 'Invalid Date';
        }
        
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
                        {ticket.departure.station} → {ticket.arrival.station}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(ticket.departure.time)} - {formatTime(ticket.arrival.time)}
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