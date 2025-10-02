
import React, { useState } from 'react';
import { Ticket, TrainClass, NavigationTab } from '../types';
import { 
    ShoppingCartIcon, MessageIcon, FlagIcon, BellIcon, QRIcon, MoneyIcon, ClockIcon,
    TrainIcon, BuildingIcon, PackageIcon, MoreIcon, TrophyIcon, CoinIcon, SparklesIcon,
    ArrowRightIcon
} from '../components/icons/FeatureIcons';

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

    // Fungsi untuk KAI PAY
    const handleKAIPayActivation = () => {
        setServiceStates(prev => ({
            ...prev,
            kaipayActivated: !prev.kaipayActivated
        }));
        
        alert(`💳 KAI PAY ${serviceStates.kaipayActivated ? 'Deactivated' : 'Activated'}\n\nKAI PAY Anda telah ${serviceStates.kaipayActivated ? 'dinonaktifkan' : 'diaktifkan'}.`);
    };

    const handleScanQR = () => {
        alert('📱 QR Code Scanner\n\nArahkan kamera ke QR code untuk melakukan pembayaran atau mendapatkan informasi.');
    };

    const handleTopUp = () => {
        alert('💰 Top Up Balance\n\nPilih metode top up:\n• Bank Transfer\n• Credit Card\n• E-Wallet\n• Mini Market');
    };

    const handleHistory = () => {
        alert('📋 Transaction History\n\nRiwayat transaksi KAI PAY Anda akan ditampilkan di sini.');
    };

    const handleBecomeMember = () => {
        alert('👑 Become Basic Member\n\nNikmati berbagai keuntungan dengan menjadi member KAI Access!\n\n• Poin reward 2x lipat\n• Prioritas customer service\n• Diskon khusus member');
    };

    // Fungsi untuk service buttons
    const handleInterCity = () => {
        alert('🚄 Inter City Train\n\nPesan tiket kereta antarkota dengan mudah.\nDestinasi: Jakarta, Surabaya, Yogyakarta, dll.');
        setActiveTab(NavigationTab.Planner);
    };

    const handleLocal = () => {
        alert('🚂 Local Train\n\nPesan tiket kereta lokal untuk perjalanan jarak dekat.');
        setActiveTab(NavigationTab.Planner);
    };

    const handleCommuterLine = () => {
        alert('🚇 Commuter Line\n\nPesan tiket commuter line untuk perjalanan harian.');
        setActiveTab(NavigationTab.Planner);
    };

    const handleLRT = () => {
        alert('🚈 LRT (Light Rail Transit)\n\nPesan tiket LRT untuk perjalanan cepat di dalam kota.');
        setActiveTab(NavigationTab.Planner);
    };

    const handleAirport = () => {
        alert('✈️ Airport Train\n\nPesan tiket kereta bandara untuk perjalanan ke/dari bandara.');
        setActiveTab(NavigationTab.Planner);
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
