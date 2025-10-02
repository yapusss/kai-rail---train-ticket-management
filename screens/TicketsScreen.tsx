import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, TrainClass } from '../types';
import { interpretSearchQuery } from '../services/geminiService';
import { SearchIcon, MicrophoneIcon, FilterIcon, DownloadIcon, RebookIcon, ArrowRightIcon } from '../components/icons/FeatureIcons';

// Mock Data
const MOCK_TICKETS: Ticket[] = [
  { id: '1', bookingCode: 'TIX-1A2B', trainName: 'Argo Bromo', trainClass: TrainClass.Executive, route: { from: 'Jakarta', to: 'Surabaya' }, departure: { station: 'Gambir', time: new Date('2023-09-15T08:00:00') }, arrival: { station: 'Pasar Turi', time: new Date('2023-09-15T16:30:00') }, passengers: [{ name: 'User', id: '1' }], price: 600000, isActive: false },
  { id: '2', bookingCode: 'TIX-3C4D', trainName: 'Jayabaya', trainClass: TrainClass.Economy, route: { from: 'Jakarta', to: 'Malang' }, departure: { station: 'Pasar Senen', time: new Date('2023-11-20T16:45:00') }, arrival: { station: 'Malang', time: new Date('2023-11-21T05:50:00') }, passengers: [{ name: 'User', id: '1' }], price: 450000, isActive: false },
  { id: '3', bookingCode: 'TIX-5E6F', trainName: 'Taksaka', trainClass: TrainClass.Luxury, route: { from: 'Jakarta', to: 'Yogyakarta' }, departure: { station: 'Gambir', time: new Date('2024-01-10T21:00:00') }, arrival: { station: 'Tugu', time: new Date('2024-01-11T04:30:00') }, passengers: [{ name: 'User', id: '1' }], price: 550000, isActive: false },
  { id: '4', bookingCode: 'TIX-7G8H', trainName: 'Serayu', trainClass: TrainClass.Economy, route: { from: 'Jakarta', to: 'Purwokerto' }, departure: { station: 'Pasar Senen', time: new Date('2024-03-05T09:15:00') }, arrival: { station: 'Purwokerto', time: new Date('2024-03-05T15:30:00') }, passengers: [{ name: 'User', id: '1' }], price: 70000, isActive: false },
];

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

    const handleAISearch = async (query: string) => {
        if (!query.trim()) {
            setFilters({});
            return;
        }
        const interpretedFilters = await interpretSearchQuery(query);
        if (interpretedFilters) {
            setFilters(interpretedFilters);
        }
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
            const matchMonth = !filters.month || ticket.departure.time.getMonth() + 1 === filters.month;
            const matchYear = !filters.year || ticket.departure.time.getFullYear() === filters.year;
            
            const lowerCaseText = filters.text?.toLowerCase() || '';
            const matchText = !filters.text ||
                ticket.trainName.toLowerCase().includes(lowerCaseText) ||
                ticket.route.from.toLowerCase().includes(lowerCaseText) ||
                ticket.route.to.toLowerCase().includes(lowerCaseText) ||
                ticket.bookingCode.toLowerCase().includes(lowerCaseText);
            
            // If AI filters are active, use them
            if (Object.keys(filters).length > 0) {
                 return matchMonth && matchYear && matchText;
            }

            // Fallback to simple text search if no AI filters
            const lowerQuery = searchQuery.toLowerCase();
            return ticket.trainName.toLowerCase().includes(lowerQuery) ||
                ticket.route.from.toLowerCase().includes(lowerQuery) ||
                ticket.route.to.toLowerCase().includes(lowerQuery);
        });
    }, [filters, searchQuery]);

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Riwayat Tiket</h2>
            
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Cari 'tiket bulan september'..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-16 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                <SearchIcon className="absolute left-3 w-5 h-5 text-gray-400" />
                <div className="absolute right-3 flex items-center space-x-1">
                    <button type="button" onClick={handleVoiceSearch} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        <MicrophoneIcon className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <FilterIcon className="w-5 h-5" />
                    </button>
                </div>
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