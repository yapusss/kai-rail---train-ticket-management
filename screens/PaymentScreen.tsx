import React, { useState } from 'react';
import { ArrowLeftIcon } from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';
import { NavigationTab } from '../types';
import { PaymentService, PaymentMethod, PaymentData } from '../services/paymentService';
import Swal from 'sweetalert2';

interface PaymentScreenProps {
    bookingData: {
        serviceType: string;
        departureStation: string;
        arrivalStation: string;
        fare: number;
        distance: number;
        travelTime: number;
        passengers?: number;
        date?: string;
    };
    setActiveTab: (tab: NavigationTab) => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ bookingData, setActiveTab }) => {
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethods] = useState<PaymentMethod[]>(PaymentService.getUserPaymentMethods());

    React.useEffect(() => {
        const primaryMethod = PaymentService.getPrimaryPaymentMethod();
        if (primaryMethod) {
            setSelectedPaymentMethodId(primaryMethod.id);
        }
    }, []);

    const formatPrice = (price: number) => {
        return `Rp ${price.toLocaleString('id-ID')}`;
    };

    const handlePayment = async () => {
        if (!selectedPaymentMethodId) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Metode Pembayaran',
                text: 'Silakan pilih metode pembayaran terlebih dahulu',
                confirmButtonText: 'Baik'
            });
            return;
        }

        const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedPaymentMethodId);
        if (!selectedPaymentMethod) return;

        setIsProcessing(true);

        const paymentData: PaymentData = {
            bookingData,
            selectedPaymentMethod
        };

        try {
            const result = await PaymentService.processPayment(paymentData);
            
            if (result.success) {
                const ticket = PaymentService.createTicketFromPayment(paymentData, result.transactionId!);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Pembayaran Berhasil!',
                    text: `Tiket berhasil dibeli dengan kode booking: ${ticket.bookingCode}`,
                    confirmButtonText: 'Lihat Tiket'
                }).then(() => {
                    setActiveTab(NavigationTab.Tickets);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Pembayaran Gagal',
                    text: result.message,
                    confirmButtonText: 'Coba Lagi'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Terjadi Kesalahan',
                text: 'Gagal memproses pembayaran. Silakan coba lagi.',
                confirmButtonText: 'Baik'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (showQR) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setShowQR(false)}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">Pembayaran QR Code</h1>
                        <div className="w-8 h-8" />
                    </div>
                </div>

                <div className="p-4 space-y-6">
            {}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md text-center">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-8">
                            <div className="text-gray-400 dark:text-gray-500 text-sm">
                                QR Code Pembayaran
                            </div>
                            <div className="w-48 h-48 bg-gray-200 dark:bg-gray-600 rounded-lg mx-auto mt-4 flex items-center justify-center">
                                <div className="text-gray-500 dark:text-gray-400">QR Code</div>
                            </div>
                        </div>
                        
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                            {formatPrice(bookingData.fare)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Scan untuk membayar
                        </p>
                    </div>

            {}
                    <button
                        onClick={() => setActiveTab(NavigationTab.Dashboard)}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-b-3xl">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setActiveTab(NavigationTab.BookingForm)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Pembayaran</h1>
                    <div className="w-8 h-8" />
                </div>
            </div>

            <div className="p-4 space-y-4">
            {}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Ringkasan Perjalanan</h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Keberangkatan</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{bookingData.departureStation}</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Tujuan</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{bookingData.arrivalStation}</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Jarak</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{bookingData.distance} Km</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Estimasi Waktu</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{TrainDataService.formatTravelTime(bookingData.travelTime)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Penumpang</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{bookingData.passengers || 1} orang</span>
                        </div>
                        
                        <div className="border-t pt-3 flex justify-between">
                            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total Bayar</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(bookingData.fare)}</span>
                        </div>
                    </div>
                </div>

            {}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Metode Pembayaran</h3>
                    
                    <div className="space-y-3">
                        {paymentMethods.map((method) => (
                            <label 
                                key={method.id}
                                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                    selectedPaymentMethodId === method.id 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                        : 'border-gray-200 dark:border-gray-600'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value={method.id}
                                    checked={selectedPaymentMethodId === method.id}
                                    onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                                    className="mr-3"
                                />
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 ${PaymentService.getPaymentMethodColor(method)} rounded-lg flex items-center justify-center`}>
                                        <svg className={`w-5 h-5 ${PaymentService.getPaymentMethodIcon(method as any).className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={PaymentService.getPaymentMethodIcon(method as any).path} />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{method.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{method.details}</p>
                                        {method.isPrimary && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                                                Utama
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

            {}
                <button
                    onClick={handlePayment}
                    disabled={isProcessing || !selectedPaymentMethodId}
                    className={`w-full py-4 text-white font-semibold rounded-lg text-lg transition-colors ${
                        isProcessing || !selectedPaymentMethodId
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isProcessing ? (
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Memproses Pembayaran...</span>
                        </div>
                    ) : (
                        'Bayar Sekarang'
                    )}
                </button>
            </div>
        </div>
    );
};

export default PaymentScreen;