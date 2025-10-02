
import React, { useState } from 'react';
import { Ticket, TrainClass, NavigationTab } from '../types';
import { ArrowRightIcon, BellIcon, FoodIcon, EmergencyIcon, AttendantIcon } from '../components/icons/FeatureIcons';

const MOCK_ACTIVE_TICKET: Ticket = {
  id: 'active123',
  bookingCode: 'KAI-ACTIVE',
  trainName: 'Argo Bromo Anggrek',
  trainClass: TrainClass.Executive,
  route: { from: 'Jakarta', to: 'Surabaya' },
  departure: { station: 'Stasiun Gambir', time: new Date() },
  arrival: { station: 'Stasiun Pasar Turi', time: new Date(new Date().getTime() + 8.5 * 60 * 60 * 1000) },
  passengers: [{ name: 'John Doe', id: '12345' }],
  price: 600000,
  isActive: true,
};

const ServiceButton: React.FC<{ 
    Icon: React.ElementType; 
    label: string; 
    onClick: () => void;
    isActive?: boolean;
}> = ({ Icon, label, onClick, isActive = false }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center space-y-2 text-center group transition-all ${
            isActive ? 'scale-95' : 'hover:scale-105'
        }`}
    >
        <div className={`p-4 rounded-full transition-colors ${
            isActive 
                ? 'bg-green-100 dark:bg-green-900/50' 
                : 'bg-red-100 dark:bg-red-900/50 group-hover:bg-red-200 dark:group-hover:bg-red-800/70'
        }`}>
            <Icon className={`w-8 h-8 transition-colors ${
                isActive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
            }`} />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </button>
);

interface DashboardScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveTab }) => {
    const formatTime = (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    // State untuk tracking status layanan
    const [serviceStates, setServiceStates] = useState({
        attendantCalled: false,
        foodOrdered: false,
        emergencyAlert: false,
        notifications: false
    });

    // Fungsi untuk notifikasi
    const handleNotificationToggle = () => {
        setServiceStates(prev => ({
            ...prev,
            notifications: !prev.notifications
        }));
        
        if (!serviceStates.notifications) {
            alert('🔔 Notifikasi diaktifkan!\nAnda akan menerima update perjalanan dan informasi penting.');
        } else {
            alert('🔕 Notifikasi dinonaktifkan.');
        }
    };

    // Fungsi untuk memanggil petugas
    const handleCallAttendant = () => {
        setServiceStates(prev => ({
            ...prev,
            attendantCalled: true
        }));
        
        alert('👨‍💼 Petugas telah dipanggil!\n\nPetugas akan segera datang ke tempat duduk Anda.\nNomor kursi: A1\nEstimasi waktu: 2-5 menit');
        
        // Reset status setelah 10 detik
        setTimeout(() => {
            setServiceStates(prev => ({
                ...prev,
                attendantCalled: false
            }));
        }, 10000);
    };

    // Fungsi untuk pesan makanan
    const handleOrderFood = () => {
        setServiceStates(prev => ({
            ...prev,
            foodOrdered: true
        }));
        
        const menuItems = [
            '🍱 Nasi Gudeg - Rp 25.000',
            '🍜 Soto Ayam - Rp 20.000',
            '🥤 Es Teh Manis - Rp 8.000',
            '☕ Kopi Hitam - Rp 10.000',
            '🍰 Kue Lapis - Rp 15.000'
        ];

        window.alert(`🍽️ Menu Makanan Kereta:\n\n${menuItems.join('\n')}\n\nSilakan hubungi petugas untuk memesan makanan yang diinginkan.`);
        
        alert(`🍽️ Menu Makanan Kereta:\n\n${menuItems.join('\n')}\n\nSilakan hubungi petugas untuk memesan makanan yang diinginkan.`);
        
        // Reset status setelah 15 detik
        setTimeout(() => {
            setServiceStates(prev => ({
                ...prev,
                foodOrdered: false
            }));
        }, 15000);
    };

    // Fungsi untuk alarm darurat
    const handleEmergencyAlert = () => {
        const confirmed = window.confirm('🚨 ALARM DARURAT 🚨\n\nApakah Anda yakin ingin mengaktifkan alarm darurat?\n\nIni akan memanggil petugas keamanan dan konduktor kereta.');
        
        if (confirmed) {
            setServiceStates(prev => ({
                ...prev,
                emergencyAlert: true
            }));
            
            alert('🚨 ALARM DARURAT AKTIF!\n\nPetugas keamanan telah diberitahu dan akan segera datang.\n\nJika ini kesalahan, silakan hubungi petugas untuk mematikan alarm.');
            
            // Reset status setelah 30 detik
            setTimeout(() => {
                setServiceStates(prev => ({
                    ...prev,
                    emergencyAlert: false
                }));
            }, 30000);
        }
    };

    // Fungsi untuk beli tiket baru
    const handleBuyNewTicket = () => {
        alert('🎫 Pembelian Tiket Baru\n\nAnda akan dialihkan ke halaman AI Trip Planner untuk mencari dan memesan tiket baru.');
        
        // Navigasi ke halaman planner
        setActiveTab(NavigationTab.Planner);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold">AKTIF</span>
                </div>
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm opacity-80 mb-1">Perjalanan Aktif</p>
                        <h2 className="text-2xl font-bold">{MOCK_ACTIVE_TICKET.trainName}</h2>
                        <p className="font-medium opacity-90">{MOCK_ACTIVE_TICKET.trainClass}</p>
                    </div>
                    <button 
                        onClick={handleNotificationToggle}
                        className={`bg-white/20 p-2 rounded-full transition-colors hover:bg-white/30 ${
                            serviceStates.notifications ? 'bg-green-500/30' : ''
                        }`}
                    >
                        <BellIcon className="w-6 h-6" />
                    </button>
                </div>
                {/* Booking Code */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4">
                    <p className="text-xs opacity-80 mb-1">Kode Booking</p>
                    <p className="text-lg font-bold">{MOCK_ACTIVE_TICKET.bookingCode}</p>
                </div>

                <div className="flex items-center justify-between space-x-2">
                    <div className="text-center">
                        <p className="text-2xl font-semibold">{formatTime(MOCK_ACTIVE_TICKET.departure.time)}</p>
                        <p className="text-xs opacity-80 uppercase">{MOCK_ACTIVE_TICKET.route.from}</p>
                    </div>
                    <div className="flex-grow flex items-center">
                        <div className="w-full h-1 bg-white/30 rounded-full flex items-center">
                           <ArrowRightIcon className="w-6 h-6 text-white -translate-x-1/2" style={{ marginLeft: '30%' }} />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-semibold">{formatTime(MOCK_ACTIVE_TICKET.arrival.time)}</p>
                        <p className="text-xs opacity-80 uppercase">{MOCK_ACTIVE_TICKET.route.to}</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Layanan Perjalanan</h3>
                <div className="grid grid-cols-3 gap-4">
                    <ServiceButton 
                        Icon={AttendantIcon} 
                        label="Panggil Petugas" 
                        onClick={handleCallAttendant}
                        isActive={serviceStates.attendantCalled}
                    />
                    <ServiceButton 
                        Icon={FoodIcon} 
                        label="Pesan Makanan" 
                        onClick={handleOrderFood}
                        isActive={serviceStates.foodOrdered}
                    />
                    <ServiceButton 
                        Icon={EmergencyIcon} 
                        label="Alarm Darurat" 
                        onClick={handleEmergencyAlert}
                        isActive={serviceStates.emergencyAlert}
                    />
                </div>
            </div>

             <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pembelian Tiket</h3>
                <button 
                    onClick={handleBuyNewTicket}
                    className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-red-700 transition-transform transform hover:scale-105"
                >
                    Beli Tiket Baru
                </button>
            </div>
        </div>
    );
};

export default DashboardScreen;
